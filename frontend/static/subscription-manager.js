// ========================================
// GESTOR DE SUSCRIPCIONES AXYRA
// ========================================
// Sistema completo para gestionar suscripciones, renovaciones y pagos

class AxyraSubscriptionManager {
    constructor() {
        this.currentUser = null;
        this.currentSubscription = null;
        this.init();
    }

    init() {
        console.log('📋 Inicializando gestor de suscripciones...');
        this.setupAuthListener();
        this.setupEventListeners();
        console.log('✅ Gestor de suscripciones inicializado');
    }

    setupAuthListener() {
        if (window.firebase && window.firebase.auth) {
            window.firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    await this.loadUserSubscription();
                } else {
                    this.currentUser = null;
                    this.currentSubscription = null;
                }
            });
        }
    }

    setupEventListeners() {
        // Event listeners para gestión de suscripciones
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-subscription-action]')) {
                const action = e.target.dataset.subscriptionAction;
                const planId = e.target.dataset.plan;
                this.handleSubscriptionAction(action, planId);
            }
        });
    }

    async loadUserSubscription() {
        try {
            if (!this.currentUser) return;

            console.log('📋 Cargando suscripción del usuario...');
            
            const userDoc = await window.firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                this.currentSubscription = userData.membership || null;
                this.updateSubscriptionUI();
                console.log('✅ Suscripción cargada:', this.currentSubscription);
            }
        } catch (error) {
            console.error('❌ Error cargando suscripción:', error);
        }
    }

    updateSubscriptionUI() {
        // Actualizar UI con información de la suscripción
        const subscriptionStatus = document.getElementById('subscriptionStatus');
        const subscriptionPlan = document.getElementById('subscriptionPlan');
        const subscriptionExpiry = document.getElementById('subscriptionExpiry');
        const renewalStatus = document.getElementById('renewalStatus');

        if (this.currentSubscription) {
            if (subscriptionStatus) {
                subscriptionStatus.textContent = this.getStatusText(this.currentSubscription.status);
                subscriptionStatus.className = `status-${this.currentSubscription.status}`;
            }

            if (subscriptionPlan) {
                subscriptionPlan.textContent = this.getPlanName(this.currentSubscription.plan);
            }

            if (subscriptionExpiry) {
                const expiryDate = this.currentSubscription.endDate?.toDate();
                subscriptionExpiry.textContent = expiryDate ? 
                    expiryDate.toLocaleDateString('es-CO') : 'No disponible';
            }

            if (renewalStatus) {
                renewalStatus.textContent = this.currentSubscription.autoRenewal ? 
                    'Renovación automática activada' : 'Renovación automática desactivada';
                renewalStatus.className = this.currentSubscription.autoRenewal ? 
                    'renewal-enabled' : 'renewal-disabled';
            }
        }
    }

    async handleSubscriptionAction(action, planId) {
        try {
            switch (action) {
                case 'upgrade':
                    await this.upgradeSubscription(planId);
                    break;
                case 'downgrade':
                    await this.downgradeSubscription(planId);
                    break;
                case 'cancel':
                    await this.cancelSubscription();
                    break;
                case 'renew':
                    await this.renewSubscription();
                    break;
                case 'toggle_auto_renewal':
                    await this.toggleAutoRenewal();
                    break;
                default:
                    console.warn('Acción de suscripción no reconocida:', action);
            }
        } catch (error) {
            console.error('❌ Error manejando acción de suscripción:', error);
            this.showError('Error procesando la acción. Intenta de nuevo.');
        }
    }

    async upgradeSubscription(newPlanId) {
        try {
            if (!this.currentUser) {
                this.showError('Debes iniciar sesión para actualizar tu suscripción');
                return;
            }

            console.log(`📈 Actualizando suscripción a: ${newPlanId}`);
            
            // Verificar si el plan es válido
            const planDetails = this.getPlanDetails(newPlanId);
            if (!planDetails) {
                this.showError('Plan no válido');
                return;
            }

            // Mostrar confirmación
            const confirmed = await this.showConfirmation(
                'Actualizar Suscripción',
                `¿Estás seguro de que quieres actualizar a ${planDetails.name}?`
            );

            if (!confirmed) return;

            // Procesar actualización
            if (window.axyraWompiIntegration) {
                await window.axyraWompiIntegration.initiatePayment(newPlanId);
            } else {
                this.showError('Sistema de pagos no disponible');
            }
        } catch (error) {
            console.error('❌ Error actualizando suscripción:', error);
            this.showError('Error actualizando la suscripción');
        }
    }

    async downgradeSubscription(newPlanId) {
        try {
            console.log(`📉 Degradando suscripción a: ${newPlanId}`);
            
            const confirmed = await this.showConfirmation(
                'Degradar Suscripción',
                '¿Estás seguro de que quieres degradar tu suscripción? Los cambios se aplicarán en el próximo ciclo de facturación.'
            );

            if (!confirmed) return;

            // Actualizar suscripción (se aplicará en el próximo ciclo)
            await this.updateSubscriptionPlan(newPlanId, 'downgrade');
            this.showSuccess('Suscripción degradada. Los cambios se aplicarán en el próximo ciclo.');
        } catch (error) {
            console.error('❌ Error degradando suscripción:', error);
            this.showError('Error degradando la suscripción');
        }
    }

    async cancelSubscription() {
        try {
            console.log('❌ Cancelando suscripción...');
            
            const confirmed = await this.showConfirmation(
                'Cancelar Suscripción',
                '¿Estás seguro de que quieres cancelar tu suscripción? Perderás acceso a todas las funcionalidades premium.'
            );

            if (!confirmed) return;

            // Cancelar suscripción
            await this.updateSubscriptionStatus('cancelled');
            this.showSuccess('Suscripción cancelada. Tu acceso continuará hasta el final del período actual.');
        } catch (error) {
            console.error('❌ Error cancelando suscripción:', error);
            this.showError('Error cancelando la suscripción');
        }
    }

    async renewSubscription() {
        try {
            console.log('🔄 Renovando suscripción...');
            
            if (!this.currentSubscription) {
                this.showError('No tienes una suscripción activa');
                return;
            }

            // Procesar renovación
            if (window.axyraWompiIntegration) {
                await window.axyraWompiIntegration.initiatePayment(this.currentSubscription.plan);
            } else {
                this.showError('Sistema de pagos no disponible');
            }
        } catch (error) {
            console.error('❌ Error renovando suscripción:', error);
            this.showError('Error renovando la suscripción');
        }
    }

    async toggleAutoRenewal() {
        try {
            if (!this.currentSubscription) {
                this.showError('No tienes una suscripción activa');
                return;
            }

            const newStatus = !this.currentSubscription.autoRenewal;
            const action = newStatus ? 'activar' : 'desactivar';
            
            const confirmed = await this.showConfirmation(
                `${action.charAt(0).toUpperCase() + action.slice(1)} Renovación Automática`,
                `¿Estás seguro de que quieres ${action} la renovación automática?`
            );

            if (!confirmed) return;

            // Actualizar estado de renovación automática
            await window.firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .update({
                    'membership.autoRenewal': newStatus,
                    'membership.lastUpdated': window.firebase.firestore.FieldValue.serverTimestamp()
                });

            this.currentSubscription.autoRenewal = newStatus;
            this.updateSubscriptionUI();
            
            this.showSuccess(`Renovación automática ${action}da correctamente`);
        } catch (error) {
            console.error('❌ Error cambiando renovación automática:', error);
            this.showError('Error cambiando la renovación automática');
        }
    }

    async updateSubscriptionPlan(planId, type) {
        try {
            await window.firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .update({
                    'membership.pendingPlan': planId,
                    'membership.pendingChangeType': type,
                    'membership.lastUpdated': window.firebase.firestore.FieldValue.serverTimestamp()
                });

            console.log(`✅ Plan ${type}do a: ${planId}`);
        } catch (error) {
            console.error('❌ Error actualizando plan:', error);
            throw error;
        }
    }

    async updateSubscriptionStatus(status) {
        try {
            await window.firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .update({
                    'membership.status': status,
                    'membership.lastUpdated': window.firebase.firestore.FieldValue.serverTimestamp()
                });

            this.currentSubscription.status = status;
            this.updateSubscriptionUI();
            
            console.log(`✅ Estado de suscripción actualizado a: ${status}`);
        } catch (error) {
            console.error('❌ Error actualizando estado:', error);
            throw error;
        }
    }

    getStatusText(status) {
        const statusTexts = {
            'active': 'Activa',
            'inactive': 'Inactiva',
            'expired': 'Expirada',
            'cancelled': 'Cancelada',
            'payment_failed': 'Pago Fallido',
            'renewal_failed': 'Renovación Fallida'
        };
        return statusTexts[status] || 'Desconocido';
    }

    getPlanName(planId) {
        const planNames = {
            'free': 'Gratis',
            'basic': 'Básico',
            'professional': 'Profesional',
            'enterprise': 'Empresarial'
        };
        return planNames[planId] || 'Desconocido';
    }

    getPlanDetails(planId) {
        const plans = {
            'basic': {
                id: 'basic',
                name: 'Plan Básico',
                price: 49900,
                features: ['Hasta 25 empleados', 'Reportes básicos', 'Soporte por email']
            },
            'professional': {
                id: 'professional',
                name: 'Plan Profesional',
                price: 129900,
                features: ['Empleados ilimitados', 'Reportes avanzados', 'Soporte prioritario']
            },
            'enterprise': {
                id: 'enterprise',
                name: 'Plan Empresarial',
                price: 259900,
                features: ['Todo lo anterior', 'Múltiples sucursales', 'Soporte dedicado']
            }
        };
        return plans[planId];
    }

    async showConfirmation(title, message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'axyra-modal';
            modal.innerHTML = `
                <div class="axyra-modal-content">
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <div class="modal-actions">
                        <button class="axyra-btn-secondary" onclick="this.closest('.axyra-modal').remove(); window.axyraSubscriptionManager.resolveConfirmation(false)">Cancelar</button>
                        <button class="axyra-btn-primary" onclick="this.closest('.axyra-modal').remove(); window.axyraSubscriptionManager.resolveConfirmation(true)">Confirmar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Guardar referencia para resolver la promesa
            window.axyraSubscriptionManager.resolveConfirmation = resolve;
        });
    }

    showError(message) {
        if (window.axyraErrorHandler) {
            window.axyraErrorHandler.showNotification('Error', message, 'error');
        } else {
            alert(`Error: ${message}`);
        }
    }

    showSuccess(message) {
        if (window.axyraErrorHandler) {
            window.axyraErrorHandler.showNotification('Éxito', message, 'success');
        } else {
            alert(`Éxito: ${message}`);
        }
    }
}

// Inicializar gestor de suscripciones cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    if (!window.axyraSubscriptionManager) {
        window.axyraSubscriptionManager = new AxyraSubscriptionManager();
    }
});

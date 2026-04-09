/**
 * 💳 SISTEMA DE PAGOS UNIFICADO AXYRA
 * Sistema robusto para procesamiento de pagos con Wompi y PayPal
 */

class AxyraPaymentSystemUnified {
    constructor() {
        this.config = {
            wompi: {
                enabled: true,
                publicKey: 'pub_test_123456789',
                environment: 'sandbox',
                currency: 'COP'
            },
            paypal: {
                enabled: true,
                clientId: 'test',
                environment: 'sandbox',
                currency: 'USD'
            }
        };

        this.currentTransaction = null;
        this.paymentMethods = [];
        
        this.init();
    }

    async init() {
        try {
            console.log('💳 Inicializando Sistema de Pagos Unificado AXYRA...');
            
            // Verificar disponibilidad de métodos de pago
            await this.checkPaymentMethods();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            console.log('✅ Sistema de Pagos Unificado AXYRA inicializado');
        } catch (error) {
            console.error('❌ Error inicializando sistema de pagos:', error);
        }
    }

    async checkPaymentMethods() {
        this.paymentMethods = [];

        // Verificar Wompi
        if (this.config.wompi.enabled) {
            try {
                await this.initializeWompi();
                this.paymentMethods.push('wompi');
                console.log('✅ Wompi disponible');
            } catch (error) {
                console.warn('⚠️ Wompi no disponible:', error.message);
            }
        }

        // Verificar PayPal
        if (this.config.paypal.enabled) {
            try {
                await this.initializePayPal();
                this.paymentMethods.push('paypal');
                console.log('✅ PayPal disponible');
            } catch (error) {
                console.warn('⚠️ PayPal no disponible:', error.message);
            }
        }

        console.log('💳 Métodos de pago disponibles:', this.paymentMethods);
    }

    async initializeWompi() {
        return new Promise((resolve, reject) => {
            // Simular inicialización de Wompi
            setTimeout(() => {
                if (this.config.wompi.enabled) {
                    resolve();
                } else {
                    reject(new Error('Wompi deshabilitado'));
                }
            }, 1000);
        });
    }

    async initializePayPal() {
        return new Promise((resolve, reject) => {
            // Simular inicialización de PayPal
            setTimeout(() => {
                if (this.config.paypal.enabled) {
                    resolve();
                } else {
                    reject(new Error('PayPal deshabilitado'));
                }
            }, 1000);
        });
    }

    setupEventListeners() {
        // Event listeners para procesamiento de pagos
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-process-payment]')) {
                const planId = e.target.getAttribute('data-plan');
                const method = e.target.getAttribute('data-method');
                this.processPayment(planId, method);
            }
        });
    }

    async processPayment(planId, method) {
        try {
            console.log('💳 Procesando pago:', { planId, method });

            if (!this.paymentMethods.includes(method)) {
                throw new Error(`Método de pago ${method} no disponible`);
            }

            const plan = this.getPlanData(planId);
            if (!plan) {
                throw new Error('Plan no encontrado');
            }

            // Crear transacción
            this.currentTransaction = {
                id: `AXYRA-${Date.now()}`,
                planId: planId,
                method: method,
                amount: plan.price,
                currency: plan.currency,
                status: 'pending',
                timestamp: new Date()
            };

            // Procesar según el método
            if (method === 'wompi') {
                return await this.processWompiPayment(plan);
            } else if (method === 'paypal') {
                return await this.processPayPalPayment(plan);
            } else {
                throw new Error('Método de pago no soportado');
            }

        } catch (error) {
            console.error('❌ Error procesando pago:', error);
            this.handlePaymentError(error);
            throw error;
        }
    }

    async processWompiPayment(plan) {
        try {
            console.log('🔄 Procesando pago con Wompi...', plan);

            // Simular procesamiento de Wompi
            const wompiData = {
                amount_in_cents: plan.price * 100,
                currency: plan.currency,
                customer_email: this.getCurrentUserEmail(),
                payment_method: {
                    type: 'CARD',
                    installments: 1
                },
                reference: this.currentTransaction.id,
                customer_data: {
                    email: this.getCurrentUserEmail(),
                    full_name: this.getCurrentUserName()
                }
            };

            console.log('📋 Datos de Wompi:', wompiData);

            // Simular respuesta exitosa
            const response = await this.simulateWompiResponse(wompiData);
            
            if (response.success) {
                this.currentTransaction.status = 'completed';
                this.currentTransaction.wompiTransactionId = response.transaction_id;
                
                console.log('✅ Pago con Wompi procesado exitosamente');
                return response;
            } else {
                throw new Error(response.error || 'Error procesando pago con Wompi');
            }

        } catch (error) {
            console.error('❌ Error procesando pago con Wompi:', error);
            this.currentTransaction.status = 'failed';
            throw error;
        }
    }

    async processPayPalPayment(plan) {
        try {
            console.log('🔄 Procesando pago con PayPal...', plan);

            // Simular procesamiento de PayPal
            const paypalData = {
                amount: plan.price,
                currency: plan.currency,
                description: `AXYRA - ${plan.name}`,
                return_url: window.location.href,
                cancel_url: window.location.href
            };

            console.log('📋 Datos de PayPal:', paypalData);

            // Simular respuesta exitosa
            const response = await this.simulatePayPalResponse(paypalData);
            
            if (response.success) {
                this.currentTransaction.status = 'completed';
                this.currentTransaction.paypalTransactionId = response.transaction_id;
                
                console.log('✅ Pago con PayPal procesado exitosamente');
                return response;
            } else {
                throw new Error(response.error || 'Error procesando pago con PayPal');
            }

        } catch (error) {
            console.error('❌ Error procesando pago con PayPal:', error);
            this.currentTransaction.status = 'failed';
            throw error;
        }
    }

    async simulateWompiResponse(data) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular respuesta exitosa
        return {
            success: true,
            transaction_id: `WOMPI_${Date.now()}`,
            status: 'APPROVED',
            amount: data.amount_in_cents,
            currency: data.currency,
            reference: data.reference
        };
    }

    async simulatePayPalResponse(data) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular respuesta exitosa
        return {
            success: true,
            transaction_id: `PAYPAL_${Date.now()}`,
            status: 'COMPLETED',
            amount: data.amount,
            currency: data.currency
        };
    }

    getPlanData(planId) {
        const plans = {
            free: { name: 'Plan Gratuito', price: 0, currency: 'COP' },
            basic: { name: 'Plan Básico', price: 49900, currency: 'COP' },
            professional: { name: 'Plan Profesional', price: 129900, currency: 'COP' },
            enterprise: { name: 'Plan Empresarial', price: 259900, currency: 'COP' }
        };
        
        return plans[planId];
    }

    getCurrentUserEmail() {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            return firebase.auth().currentUser.email;
        }
        return 'usuario@axyra.com';
    }

    getCurrentUserName() {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            return firebase.auth().currentUser.displayName || 'Usuario AXYRA';
        }
        return 'Usuario AXYRA';
    }

    handlePaymentError(error) {
        console.error('❌ Error en pago:', error);
        
        // Mostrar notificación al usuario
        this.showNotification('Error procesando pago: ' + error.message, 'error');
        
        // Actualizar estado de la transacción
        if (this.currentTransaction) {
            this.currentTransaction.status = 'failed';
            this.currentTransaction.error = error.message;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `axyra-notification axyra-notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10001;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Métodos públicos
    getAvailablePaymentMethods() {
        return this.paymentMethods;
    }

    getCurrentTransaction() {
        return this.currentTransaction;
    }

    isPaymentMethodAvailable(method) {
        return this.paymentMethods.includes(method);
    }

    // Método para verificar estado de pago
    async verifyPayment(transactionId) {
        try {
            console.log('🔍 Verificando pago:', transactionId);
            
            // Simular verificación
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return {
                success: true,
                status: 'completed',
                transaction_id: transactionId
            };
        } catch (error) {
            console.error('❌ Error verificando pago:', error);
            throw error;
        }
    }
}

// Inicializar el sistema de pagos
window.axyraPaymentSystem = new AxyraPaymentSystemUnified();

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AxyraPaymentSystemUnified;
}

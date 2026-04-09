// ========================================
// SISTEMA DE NOTIFICACIONES MEJORADO AXYRA
// Notificaciones que se pueden cerrar correctamente
// ========================================

class NotificationsEnhanced {
    constructor() {
        this.isInitialized = false;
        this.notifications = [];
        this.maxNotifications = 5;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔔 Inicializando sistema de notificaciones mejorado...');
        this.setupNotificationContainer();
        this.isInitialized = true;
        console.log('✅ Sistema de notificaciones mejorado inicializado');
    }

    setupNotificationContainer() {
        // Crear contenedor de notificaciones si no existe
        if (!document.getElementById('axyra-notifications-container')) {
            const container = document.createElement('div');
            container.id = 'axyra-notifications-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
    }

    showNotification(options) {
        const {
            type = 'info',
            title = 'Notificación',
            message = '',
            duration = 5000,
            closable = true
        } = options;

        const notification = this.createNotification({
            type,
            title,
            message,
            closable
        });

        this.addNotification(notification);
        
        // Auto-remover después de la duración especificada
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, duration);
        }

        return notification.id;
    }

    createNotification({ type, title, message, closable }) {
        const id = 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = 'axyra-notification';
        
        const typeConfig = this.getTypeConfig(type);
        
        notification.innerHTML = `
            <div style="
                background: ${typeConfig.background};
                color: ${typeConfig.color};
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                margin-bottom: 10px;
                pointer-events: auto;
                position: relative;
                min-width: 300px;
                max-width: 400px;
                font-family: 'Segoe UI', sans-serif;
                border-left: 4px solid ${typeConfig.borderColor};
            ">
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <div style="font-size: 20px; margin-top: 2px;">
                        ${typeConfig.icon}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">
                            ${title}
                        </div>
                        <div style="font-size: 13px; opacity: 0.9; line-height: 1.4;">
                            ${message}
                        </div>
                    </div>
                    ${closable ? `
                        <button onclick="window.notificationsEnhanced.removeNotification('${id}')" 
                                style="
                                    background: none;
                                    border: none;
                                    color: ${typeConfig.color};
                                    font-size: 18px;
                                    cursor: pointer;
                                    padding: 0;
                                    margin-left: 10px;
                                    opacity: 0.7;
                                    transition: opacity 0.2s;
                                "
                                onmouseover="this.style.opacity='1'"
                                onmouseout="this.style.opacity='0.7'">
                            ×
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        return notification;
    }

    getTypeConfig(type) {
        const configs = {
            success: {
                icon: '✅',
                background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                color: 'white',
                borderColor: '#27ae60'
            },
            error: {
                icon: '❌',
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                color: 'white',
                borderColor: '#e74c3c'
            },
            warning: {
                icon: '⚠️',
                background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                color: 'white',
                borderColor: '#f39c12'
            },
            info: {
                icon: 'ℹ️',
                background: 'linear-gradient(135deg, #3498db, #2980b9)',
                color: 'white',
                borderColor: '#3498db'
            },
            session: {
                icon: '⏰',
                background: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
                color: 'white',
                borderColor: '#9b59b6'
            }
        };

        return configs[type] || configs.info;
    }

    addNotification(notification) {
        const container = document.getElementById('axyra-notifications-container');
        if (container) {
            container.appendChild(notification);
            this.notifications.push(notification.id);
            
            // Limitar número de notificaciones
            if (this.notifications.length > this.maxNotifications) {
                const oldestId = this.notifications.shift();
                this.removeNotification(oldestId);
            }
        }
    }

    removeNotification(id) {
        const notification = document.getElementById(id);
        if (notification) {
            notification.style.animation = 'slideOut 0.3s ease-in-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
            
            // Remover de la lista
            const index = this.notifications.indexOf(id);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }
    }

    clearAllNotifications() {
        this.notifications.forEach(id => {
            this.removeNotification(id);
        });
        this.notifications = [];
    }

    // Métodos de conveniencia
    showSuccess(title, message, duration = 5000) {
        return this.showNotification({ type: 'success', title, message, duration });
    }

    showError(title, message, duration = 8000) {
        return this.showNotification({ type: 'error', title, message, duration });
    }

    showWarning(title, message, duration = 6000) {
        return this.showNotification({ type: 'warning', title, message, duration });
    }

    showInfo(title, message, duration = 5000) {
        return this.showNotification({ type: 'info', title, message, duration });
    }

    showSessionExpired() {
        return this.showNotification({
            type: 'session',
            title: 'Sesión Expirada',
            message: 'Tu sesión ha expirado por inactividad. Serás redirigido al login.',
            duration: 0, // No auto-remover
            closable: true
        });
    }
}

// Inicializar sistema de notificaciones mejorado
document.addEventListener('DOMContentLoaded', function() {
    window.notificationsEnhanced = new NotificationsEnhanced();
    
    // Agregar estilos CSS para animaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .axyra-notification {
            animation: slideIn 0.3s ease-in-out;
        }
    `;
    document.head.appendChild(style);
});

// Exportar para uso global
window.NotificationsEnhanced = NotificationsEnhanced;

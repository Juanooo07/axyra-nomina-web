// ========================================
// SISTEMA DE CONFIGURACIÓN DE EMPRESA - AXYRA
// ========================================
// Gestiona la configuración de datos de la empresa para comprobantes y documentos

class AxyraCompanyConfigSystem {
    constructor() {
        this.defaultConfig = {
            companyName: 'VILLA VENECIA',
            nit: '901.234.567-8',
            address: 'CRA. 43 SUCRE, VENECIA, ANTIOQUIA, COLOMBIA',
            phone: '+57 300 000 0000',
            email: 'info@villavenecia.com',
            website: 'www.villavenecia.com',
            logo: null,
            currency: 'COP',
            currencySymbol: '$',
            decimalPlaces: 0,
            dateFormat: 'DD/MM/YYYY',
            timeFormat: 'HH:mm',
            timezone: 'America/Bogota'
        };

        this.currentConfig = { ...this.defaultConfig };
        this.init();
    }

    init() {
        console.log('🏢 Inicializando sistema de configuración de empresa...');
        this.loadConfig();
        this.setupEventListeners();
        console.log('✅ Sistema de configuración de empresa inicializado');
    }

    async loadConfig() {
        try {
            // Intentar cargar desde Firebase
            if (window.firebase && window.firebase.firestore) {
                const configDoc = await window.firebase.firestore()
                    .collection('company_config')
                    .doc('main')
                    .get();

                if (configDoc.exists) {
                    this.currentConfig = { ...this.defaultConfig, ...configDoc.data() };
                    console.log('✅ Configuración de empresa cargada desde Firebase');
                } else {
                    // Crear configuración por defecto en Firebase
                    await this.saveConfigToFirebase();
                    console.log('✅ Configuración por defecto creada en Firebase');
                }
            } else {
                // Cargar desde localStorage como fallback
                const savedConfig = localStorage.getItem('axyra_company_config');
                if (savedConfig) {
                    this.currentConfig = { ...this.defaultConfig, ...JSON.parse(savedConfig) };
                    console.log('✅ Configuración de empresa cargada desde localStorage');
                } else {
                    console.log('ℹ️ Usando configuración por defecto');
                }
            }

            this.updateUI();
        } catch (error) {
            console.error('❌ Error cargando configuración de empresa:', error);
            this.loadFromLocalStorage();
        }
    }

    async saveConfig(configData) {
        try {
            console.log('💾 Guardando configuración de empresa...');
            
            // Actualizar configuración actual
            this.currentConfig = { ...this.currentConfig, ...configData };
            
            // Guardar en Firebase
            if (window.firebase && window.firebase.firestore) {
                await window.firebase.firestore()
                    .collection('company_config')
                    .doc('main')
                    .set(this.currentConfig, { merge: true });
                console.log('✅ Configuración guardada en Firebase');
            }

            // Guardar en localStorage como backup
            localStorage.setItem('axyra_company_config', JSON.stringify(this.currentConfig));
            console.log('✅ Configuración guardada en localStorage');

            this.updateUI();
            this.showNotification('Configuración de empresa guardada correctamente', 'success');
            
            return true;
        } catch (error) {
            console.error('❌ Error guardando configuración:', error);
            this.showNotification('Error guardando configuración: ' + error.message, 'error');
            return false;
        }
    }

    async saveConfigToFirebase() {
        try {
            if (window.firebase && window.firebase.firestore) {
                await window.firebase.firestore()
                    .collection('company_config')
                    .doc('main')
                    .set(this.currentConfig);
            }
        } catch (error) {
            console.error('❌ Error guardando configuración en Firebase:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const savedConfig = localStorage.getItem('axyra_company_config');
            if (savedConfig) {
                this.currentConfig = { ...this.defaultConfig, ...JSON.parse(savedConfig) };
                console.log('✅ Configuración cargada desde localStorage');
            }
        } catch (error) {
            console.error('❌ Error cargando desde localStorage:', error);
        }
    }

    updateUI() {
        // Actualizar campos del formulario si existe
        const companyNameInput = document.getElementById('companyName');
        const nitInput = document.getElementById('nit');
        const addressInput = document.getElementById('address');
        const phoneInput = document.getElementById('phone');
        const emailInput = document.getElementById('email');
        const websiteInput = document.getElementById('website');

        if (companyNameInput) companyNameInput.value = this.currentConfig.companyName;
        if (nitInput) nitInput.value = this.currentConfig.nit;
        if (addressInput) addressInput.value = this.currentConfig.address;
        if (phoneInput) phoneInput.value = this.currentConfig.phone;
        if (emailInput) emailInput.value = this.currentConfig.email;
        if (websiteInput) websiteInput.value = this.currentConfig.website;
    }

    setupEventListeners() {
        // Event listener para el formulario de configuración
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'companyConfigForm') {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            }
        });

        // Event listener para botones de configuración
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-company-config-action]')) {
                const action = e.target.dataset.companyConfigAction;
                this.handleConfigAction(action);
            }
        });
    }

    async handleFormSubmit(form) {
        try {
            const formData = new FormData(form);
            const configData = {
                companyName: formData.get('companyName') || this.currentConfig.companyName,
                nit: formData.get('nit') || this.currentConfig.nit,
                address: formData.get('address') || this.currentConfig.address,
                phone: formData.get('phone') || this.currentConfig.phone,
                email: formData.get('email') || this.currentConfig.email,
                website: formData.get('website') || this.currentConfig.website
            };

            const success = await this.saveConfig(configData);
            if (success) {
                // Cerrar modal si existe
                const modal = document.querySelector('.axyra-modal');
                if (modal) modal.remove();
            }
        } catch (error) {
            console.error('❌ Error procesando formulario:', error);
            this.showNotification('Error procesando formulario', 'error');
        }
    }

    handleConfigAction(action) {
        switch (action) {
            case 'save':
                this.saveCurrentForm();
                break;
            case 'reset':
                this.resetToDefault();
                break;
            case 'export':
                this.exportConfig();
                break;
            case 'import':
                this.importConfig();
                break;
        }
    }

    async saveCurrentForm() {
        const form = document.getElementById('companyConfigForm');
        if (form) {
            await this.handleFormSubmit(form);
        }
    }

    async resetToDefault() {
        const confirmed = await this.showConfirmation(
            'Restaurar Configuración',
            '¿Estás seguro de que quieres restaurar la configuración por defecto?'
        );

        if (confirmed) {
            this.currentConfig = { ...this.defaultConfig };
            await this.saveConfig(this.currentConfig);
            this.updateUI();
            this.showNotification('Configuración restaurada por defecto', 'info');
        }
    }

    exportConfig() {
        try {
            const configData = {
                ...this.currentConfig,
                exportedAt: new Date().toISOString(),
                version: '1.0.0'
            };

            const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `axyra-company-config-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Configuración exportada correctamente', 'success');
        } catch (error) {
            console.error('❌ Error exportando configuración:', error);
            this.showNotification('Error exportando configuración', 'error');
        }
    }

    importConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                if (!file) return;

                const text = await file.text();
                const importedConfig = JSON.parse(text);
                
                // Validar configuración importada
                if (this.validateConfig(importedConfig)) {
                    await this.saveConfig(importedConfig);
                    this.showNotification('Configuración importada correctamente', 'success');
                } else {
                    this.showNotification('Archivo de configuración inválido', 'error');
                }
            } catch (error) {
                console.error('❌ Error importando configuración:', error);
                this.showNotification('Error importando configuración', 'error');
            }
        };
        input.click();
    }

    validateConfig(config) {
        const requiredFields = ['companyName', 'nit', 'address'];
        return requiredFields.every(field => config[field] && typeof config[field] === 'string');
    }

    // Métodos para obtener configuración
    getCompanyName() {
        return this.currentConfig.companyName;
    }

    getNIT() {
        return this.currentConfig.nit;
    }

    getAddress() {
        return this.currentConfig.address;
    }

    getPhone() {
        return this.currentConfig.phone;
    }

    getEmail() {
        return this.currentConfig.email;
    }

    getWebsite() {
        return this.currentConfig.website;
    }

    getCurrency() {
        return this.currentConfig.currency;
    }

    getCurrencySymbol() {
        return this.currentConfig.currencySymbol;
    }

    getDateFormat() {
        return this.currentConfig.dateFormat;
    }

    getTimeFormat() {
        return this.currentConfig.timeFormat;
    }

    getTimezone() {
        return this.currentConfig.timezone;
    }

    // Métodos de utilidad
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: this.currentConfig.currency,
            minimumFractionDigits: this.currentConfig.decimalPlaces,
            maximumFractionDigits: this.currentConfig.decimalPlaces
        }).format(amount);
    }

    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatTime(date) {
        const d = new Date(date);
        return d.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
        });
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
                        <button class="axyra-btn-secondary" onclick="this.closest('.axyra-modal').remove(); window.axyraCompanyConfigSystem.resolveConfirmation(false)">Cancelar</button>
                        <button class="axyra-btn-primary" onclick="this.closest('.axyra-modal').remove(); window.axyraCompanyConfigSystem.resolveConfirmation(true)">Confirmar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            window.axyraCompanyConfigSystem.resolveConfirmation = resolve;
        });
    }

    showNotification(message, type = 'info') {
        if (window.axyraErrorHandler) {
            window.axyraErrorHandler.showNotification('Configuración de Empresa', message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Inicializar sistema de configuración de empresa cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    if (!window.axyraCompanyConfigSystem) {
        window.axyraCompanyConfigSystem = new AxyraCompanyConfigSystem();
    }
});

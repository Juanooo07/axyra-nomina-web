// ========================================
// SISTEMA DE REDIRECCIÓN DE SESIÓN AXYRA
// Manejo robusto de redirecciones de autenticación
// ========================================

class SessionRedirectSystem {
    constructor() {
        this.isInitialized = false;
        this.redirectMap = {
            'login.html': 'login-optimized.html',
            'register.html': 'register.html', // Ya existe
            'dashboard.html': 'dashboard-optimized.html',
            'index.html': 'index.html' // Ya existe
        };
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔄 Inicializando sistema de redirección de sesión...');
        this.setupRedirects();
        this.handleCurrentPage();
        this.isInitialized = true;
        console.log('✅ Sistema de redirección de sesión inicializado');
    }

    setupRedirects() {
        // Interceptar redirecciones a login.html
        const originalLocation = window.location;
        
        // Verificar si estamos en una página que necesita redirección
        this.checkAndRedirect();
    }

    checkAndRedirect() {
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop();
        
        if (this.redirectMap[fileName]) {
            const targetFile = this.redirectMap[fileName];
            if (fileName !== targetFile) {
                console.log(`🔄 Redirigiendo de ${fileName} a ${targetFile}...`);
                this.redirectTo(targetFile);
            }
        }
    }

    redirectTo(targetFile) {
        try {
            // Usar replace para evitar que el usuario pueda volver atrás
            window.location.replace(targetFile);
        } catch (error) {
            console.error('❌ Error en redirección:', error);
            // Fallback: usar href
            window.location.href = targetFile;
        }
    }

    handleCurrentPage() {
        // Si estamos en login.html, redirigir inmediatamente
        if (window.location.pathname.includes('login.html')) {
            console.log('🔄 Detectada página login.html, redirigiendo...');
            this.redirectTo('login-optimized.html');
        }
    }

    // Método para redirigir a login
    redirectToLogin() {
        console.log('🔄 Redirigiendo a login...');
        this.redirectTo('login-optimized.html');
    }

    // Método para redirigir a dashboard
    redirectToDashboard() {
        console.log('🔄 Redirigiendo a dashboard...');
        this.redirectTo('dashboard-optimized.html');
    }

    // Método para redirigir a registro
    redirectToRegister() {
        console.log('🔄 Redirigiendo a registro...');
        this.redirectTo('register.html');
    }

    // Método para verificar si una página existe
    async checkPageExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Método para manejar errores de sesión expirada
    handleSessionExpired() {
        console.log('⏰ Sesión expirada, redirigiendo a login...');
        this.redirectToLogin();
    }

    // Método para manejar errores de autenticación
    handleAuthError() {
        console.log('🔐 Error de autenticación, redirigiendo a login...');
        this.redirectToLogin();
    }
}

// Inicializar sistema de redirección
document.addEventListener('DOMContentLoaded', function() {
    window.sessionRedirectSystem = new SessionRedirectSystem();
});

// Exportar para uso global
window.SessionRedirectSystem = SessionRedirectSystem;

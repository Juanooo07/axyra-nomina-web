/**
 * 🎯 HEADER COMPARTIDO AXYRA - SISTEMA DE GESTIÓN
 * Navegación inteligente y redirecciones corregidas
 */

class AxyraSharedHeader {
  constructor() {
    this.currentPage = this.detectarPaginaActual();
    console.log('📍 Página detectada:', this.currentPage);

    this.navigationItems = [
      {
        href: '../../index.html',
        icon: 'fas fa-home',
        text: 'Inicio',
        show: true,
      },
      {
        href: '../dashboard/dashboard.html',
        icon: 'fas fa-tachometer-alt',
        text: 'Dashboard',
        show: true,
      },
      {
        href: '../gestion_personal/gestion_personal.html',
        icon: 'fas fa-users-cog',
        text: 'Gestión Personal',
        show: true,
      },
      {
        href: '../cuadre_caja/cuadre_caja.html',
        icon: 'fas fa-calculator',
        text: 'Caja',
        show: true,
      },
      {
        href: '../inventario/inventario.html',
        icon: 'fas fa-boxes',
        text: 'Inventario',
        show: true,
      },
      {
        href: '../configuracion/configuracion.html',
        icon: 'fas fa-cog',
        text: 'Config',
        show: true,
      },
    ];

    this.init();
  }

  init() {
    console.log('🚀 Inicializando header compartido AXYRA...');
    this.generarNavegacion();
    this.actualizarInformacionUsuario();
    this.setupEventListeners();
    console.log('✅ Header compartido AXYRA listo para usar');
  }

  generarNavegacion() {
    const nav = document.getElementById('axyraNav');
    const pageSubtitle = document.getElementById('pageSubtitle');

    if (!nav) return;

    console.log('🔍 Generando navegación inteligente...');
    console.log('📍 Página actual:', this.currentPage);

    this.navigationItems.forEach((item) => {
      let isCurrentPage = false;

      // Detectar página actual
      if (this.currentPage === 'empleados' && item.text === 'Gestión Personal') {
        isCurrentPage = true;
      } else if (this.currentPage === 'dashboard' && item.text === 'Dashboard') {
        isCurrentPage = true;
      } else if (this.currentPage === 'gestion_personal' && item.text === 'Gestión Personal') {
        isCurrentPage = true;
      } else if (this.currentPage === 'caja' && item.text === 'Caja') {
        isCurrentPage = true;
      } else if (this.currentPage === 'inventario' && item.text === 'Inventario') {
        isCurrentPage = true;
      } else if (this.currentPage === 'configuracion' && item.text === 'Config') {
        isCurrentPage = true;
      } else if (this.currentPage === 'inicio' && item.text === 'Inicio') {
        isCurrentPage = true;
      }

      if (isCurrentPage) {
        item.active = true;
        item.show = false;
        console.log(`🚫 Ocultando botón: ${item.text} (página actual)`);

        if (pageSubtitle) {
          pageSubtitle.textContent = item.text;
          console.log(`📝 Subtítulo establecido: ${item.text}`);
        }
      } else {
        item.active = false;
        item.show = true;
        console.log(`✅ Mostrando botón: ${item.text}`);
      }
    });

    let navHTML = '';
    this.navigationItems.forEach((item) => {
      if (item.show) {
        navHTML += `
                    <a href="${item.href}" class="axyra-nav-link ${item.active ? 'active' : ''}">
                        <i class="${item.icon}"></i>
                        <span>${item.text}</span>
                    </a>
                `;
      }
    });

    nav.innerHTML = navHTML;
    console.log('📋 Navegación generada:', navHTML);
    console.log(`✅ ${this.navigationItems.filter((item) => item.show).length} enlaces de navegación insertados`);
  }

  async actualizarInformacionUsuario() {
    const userEmail = document.getElementById('userEmail');
    const roleBadge = document.getElementById('roleBadge');

    if (userEmail) {
      try {
        console.log('👤 Actualizando información del usuario...');

        // Verificar si Firebase está disponible
        if (typeof firebase === 'undefined' || !firebase.auth) {
          console.log('⚠️ Firebase no disponible, usando datos por defecto');
          this.loadUserFromLocalStorage();
          return;
        }

        // Verificar si hay usuario autenticado
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
          console.log('⚠️ Usuario no autenticado');
          this.loadUserFromLocalStorage();
          return;
        }

        try {
          userEmail.textContent = currentUser.email || 'Usuario';
          if (roleBadge) {
            const roleText = roleBadge.querySelector('.axyra-role-badge-text');
            if (roleText) {
              roleText.textContent = 'Empleado';
            }
          }
          console.log('✅ Email del usuario actualizado:', currentUser.email);
        } catch (firebaseError) {
          console.warn('⚠️ Error accediendo a Firebase:', firebaseError.message);
          this.loadUserFromLocalStorage();
        }

        if (roleBadge) {
          const roleText = roleBadge.querySelector('.axyra-role-badge-text');
          if (roleText) {
            roleText.textContent = 'Empleado';
            console.log('✅ Rol del usuario actualizado: Empleado');
          }
        }
      } catch (error) {
        console.error('Error obteniendo información del usuario:', error);
        this.loadUserFromLocalStorage();
      }
    }
  }

  loadUserFromLocalStorage() {
    const userEmail = document.getElementById('userEmail');
    const roleBadge = document.getElementById('roleBadge');

    console.log('⚠️ No hay usuario de Firebase, usando localStorage...');

    let user = localStorage.getItem('axyra_firebase_user');
    if (!user) {
      user = localStorage.getItem('axyra_isolated_user');
    }

    if (user) {
      try {
        const userData = JSON.parse(user);
        userEmail.textContent = userData.email || userData.username || 'Usuario';

        if (roleBadge) {
          const roleText = roleBadge.querySelector('.axyra-role-badge-text');
          if (roleText) {
            roleText.textContent = userData.role || 'Empleado';
          }
        }
      } catch (error) {
        console.warn('Error parseando información del usuario:', error);
        userEmail.textContent = 'Usuario';
      }
    } else {
      userEmail.textContent = 'axyra.app@gmail.com';
    }
  }

  setupEventListeners() {
    console.log('🎯 Configurando eventos del header...');

    // Evento de logout
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="logout"]')) {
        this.handleLogout();
      }
    });

    // Evento de cambio de usuario
    window.addEventListener('storage', (e) => {
      if (e.key === 'axyra_isolated_user') {
        this.actualizarInformacionUsuario();
      }
    });

    // Eventos de navegación
    document.addEventListener('click', (e) => {
      const navLink = e.target.closest('.axyra-nav-link');
      if (navLink) {
        e.preventDefault();
        const href = navLink.getAttribute('href');
        if (href) {
          console.log('🔗 Navegando a:', href);
          window.location.href = href;
        }
      }
    });

    console.log('✅ Eventos configurados correctamente');
  }

  async handleLogout() {
    console.log('🔄 Cerrando sesión desde header compartido...');

    try {
      // Intentar cerrar sesión de Firebase
      if (typeof firebase !== 'undefined' && firebase.auth) {
        await firebase.auth().signOut();
        console.log('✅ Sesión de Firebase cerrada');
      }

      // Limpiar localStorage
      localStorage.removeItem('axyra_isolated_user');
      localStorage.removeItem('axyra_firebase_user');
      sessionStorage.clear();

      // Redirigir al login
      window.location.href = '../../login-optimized.html';
    } catch (error) {
      console.error('Error cerrando sesión:', error);

      // Limpiar localStorage de todas formas
      localStorage.removeItem('axyra_isolated_user');
      localStorage.removeItem('axyra_firebase_user');
      sessionStorage.clear();

      // Redirigir al login
      window.location.href = '../../login-optimized.html';
    }
  }

  setPageSubtitle(text) {
    const pageSubtitle = document.getElementById('pageSubtitle');
    if (pageSubtitle) {
      pageSubtitle.textContent = text;
    }
  }

  setUserRole(role) {
    const roleBadge = document.getElementById('roleBadge');
    if (roleBadge) {
      const roleText = roleBadge.querySelector('.axyra-role-badge-text');
      if (roleText) {
        roleText.textContent = role;
      }
    }
  }

  detectarPaginaActual() {
    const url = window.location.href;
    const pathname = window.location.pathname;

    console.log('🔍 URL completa:', url);
    console.log('🔍 Pathname:', pathname);

    if (url.includes('/empleados/') || pathname.includes('/empleados/')) {
      console.log('🎯 Página detectada como: empleados');
      return 'empleados';
    } else if (url.includes('/dashboard/') || pathname.includes('/dashboard/')) {
      console.log('🎯 Página detectada como: dashboard');
      return 'dashboard';
    } else if (url.includes('/horas/') || pathname.includes('/horas/')) {
      console.log('🎯 Página detectada como: horas');
      return 'horas';
    } else if (url.includes('/nomina/') || pathname.includes('/nomina/')) {
      console.log('🎯 Página detectada como: nomina');
      return 'nomina';
    } else if (url.includes('/gestion_personal/') || pathname.includes('/gestion_personal/')) {
      console.log('🎯 Página detectada como: gestion_personal');
      return 'gestion_personal';
    } else if (url.includes('/cuadre_caja/') || pathname.includes('/cuadre_caja/')) {
      console.log('🎯 Página detectada como: caja');
      return 'caja';
    } else if (url.includes('/inventario/') || pathname.includes('/inventario/')) {
      console.log('🎯 Página detectada como: inventario');
      return 'inventario';
    } else if (url.includes('/configuracion/') || pathname.includes('/configuracion/')) {
      console.log('🎯 Página detectada como: configuracion');
      return 'configuracion';
    } else if (
      url.includes('/index.html') ||
      pathname.includes('/index.html') ||
      url.endsWith('/') ||
      pathname.endsWith('/')
    ) {
      console.log('🎯 Página detectada como: inicio');
      return 'inicio';
    } else {
      console.log('🎯 Página detectada como: desconocida');
      return 'desconocida';
    }
  }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 Script del header compartido cargado');
  window.axyraSharedHeader = new AxyraSharedHeader();
});

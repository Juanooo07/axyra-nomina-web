// ========================================
// AXYRA ANALYTICS SYSTEM
// Analytics avanzados con Google Analytics
// ========================================

class AxyraAnalyticsSystem {
  constructor() {
    this.gaId = 'G-XXXXXXXXXX'; // Reemplazar con tu GA4 ID
    this.isInitialized = false;
    this.events = [];
    this.metrics = {};
    this.session = {
      startTime: Date.now(),
      pageViews: 0,
      events: 0,
      userId: null,
    };

    this.init();
  }

  async init() {
    console.log('📊 Inicializando Sistema de Analytics AXYRA...');

    try {
      await this.loadGoogleAnalytics();
      this.setupEventTracking();
      this.setupCustomMetrics();
      this.isInitialized = true;
      console.log('✅ Sistema de Analytics AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando analytics:', error);
    }
  }

  async loadGoogleAnalytics() {
    return new Promise((resolve, reject) => {
      // Cargar Google Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
      script.onload = () => {
        // Configurar gtag
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', this.gaId, {
          page_title: 'AXYRA Dashboard',
          page_location: window.location.href,
          custom_map: {
            custom_parameter_1: 'user_type',
            custom_parameter_2: 'membership_plan',
          },
        });
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  setupEventTracking() {
    // Track page views
    this.trackPageView();

    // Track user interactions
    this.trackUserInteractions();

    // Track form submissions
    this.trackFormSubmissions();

    // Track button clicks
    this.trackButtonClicks();

    // Track navigation
    this.trackNavigation();
  }

  setupCustomMetrics() {
    // Métricas personalizadas
    this.metrics = {
      totalUsers: 0,
      activeUsers: 0,
      totalSessions: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
      conversionRate: 0,
      topPages: [],
      topEvents: [],
      userEngagement: 0,
      systemPerformance: 0,
    };
  }

  // Métodos de tracking
  trackPageView(pageName = null, pagePath = null) {
    const page = pageName || document.title;
    const path = pagePath || window.location.pathname;

    this.session.pageViews++;

    if (window.gtag) {
      gtag('config', this.gaId, {
        page_title: page,
        page_location: window.location.href,
        page_path: path,
      });
    }

    this.trackEvent('page_view', {
      page_title: page,
      page_path: path,
      page_location: window.location.href,
    });
  }

  trackEvent(eventName, parameters = {}) {
    this.session.events++;

    const eventData = {
      event_name: eventName,
      parameters: {
        ...parameters,
        timestamp: Date.now(),
        session_id: this.session.startTime,
        user_id: this.session.userId,
      },
    };

    this.events.push(eventData);

    if (window.gtag) {
      gtag('event', eventName, parameters);
    }

    console.log('📊 Event tracked:', eventName, parameters);
  }

  trackUserInteractions() {
    // Track clicks en elementos importantes
    document.addEventListener('click', (event) => {
      const element = event.target;
      const tagName = element.tagName.toLowerCase();

      if (tagName === 'button' || tagName === 'a') {
        this.trackEvent('user_interaction', {
          interaction_type: 'click',
          element_type: tagName,
          element_text: element.textContent?.trim() || '',
          element_id: element.id || '',
          element_class: element.className || '',
        });
      }
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        this.trackEvent('scroll_depth', {
          scroll_percent: scrollPercent,
          page: window.location.pathname,
        });
      }
    });
  }

  trackFormSubmissions() {
    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (form.tagName === 'FORM') {
        this.trackEvent('form_submission', {
          form_id: form.id || '',
          form_class: form.className || '',
          form_action: form.action || '',
          form_method: form.method || 'POST',
        });
      }
    });
  }

  trackButtonClicks() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (button) {
        this.trackEvent('button_click', {
          button_text: button.textContent?.trim() || '',
          button_id: button.id || '',
          button_class: button.className || '',
          button_type: button.type || 'button',
        });
      }
    });
  }

  trackNavigation() {
    // Track navigation between pages
    let currentPage = window.location.pathname;

    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPage) {
        this.trackEvent('navigation', {
          from_page: currentPage,
          to_page: window.location.pathname,
          navigation_type: 'page_change',
        });
        currentPage = window.location.pathname;
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Métodos específicos de AXYRA
  trackEmployeeAction(action, employeeData = {}) {
    this.trackEvent('employee_action', {
      action_type: action,
      employee_id: employeeData.id || '',
      employee_name: employeeData.nombre || '',
      department: employeeData.departamento || '',
    });
  }

  trackInventoryAction(action, productData = {}) {
    this.trackEvent('inventory_action', {
      action_type: action,
      product_id: productData.id || '',
      product_name: productData.nombre || '',
      category: productData.categoria || '',
      stock_change: productData.stockChange || 0,
    });
  }

  trackPayrollAction(action, payrollData = {}) {
    this.trackEvent('payroll_action', {
      action_type: action,
      payroll_id: payrollData.id || '',
      total_amount: payrollData.totalAmount || 0,
      employee_count: payrollData.employeeCount || 0,
    });
  }

  trackPaymentAction(action, paymentData = {}) {
    this.trackEvent('payment_action', {
      action_type: action,
      payment_method: paymentData.method || '',
      amount: paymentData.amount || 0,
      currency: paymentData.currency || 'COP',
      success: paymentData.success || false,
    });
  }

  trackSystemAction(action, systemData = {}) {
    this.trackEvent('system_action', {
      action_type: action,
      system_component: systemData.component || '',
      system_status: systemData.status || '',
      error_message: systemData.errorMessage || '',
    });
  }

  // Métodos de métricas personalizadas
  updateUserMetrics() {
    this.metrics.totalUsers = this.getTotalUsers();
    this.metrics.activeUsers = this.getActiveUsers();
    this.metrics.totalSessions = this.getTotalSessions();
    this.metrics.averageSessionDuration = this.getAverageSessionDuration();
    this.metrics.bounceRate = this.getBounceRate();
    this.metrics.conversionRate = this.getConversionRate();
    this.metrics.topPages = this.getTopPages();
    this.metrics.topEvents = this.getTopEvents();
    this.metrics.userEngagement = this.getUserEngagement();
    this.metrics.systemPerformance = this.getSystemPerformance();
  }

  getTotalUsers() {
    // Implementar lógica para obtener total de usuarios
    return localStorage.getItem('axyra_total_users') || 0;
  }

  getActiveUsers() {
    // Implementar lógica para obtener usuarios activos
    return localStorage.getItem('axyra_active_users') || 0;
  }

  getTotalSessions() {
    return this.session.startTime ? 1 : 0;
  }

  getAverageSessionDuration() {
    const duration = Date.now() - this.session.startTime;
    return Math.round(duration / 1000 / 60); // en minutos
  }

  getBounceRate() {
    // Implementar lógica para calcular bounce rate
    return 0;
  }

  getConversionRate() {
    // Implementar lógica para calcular conversion rate
    return 0;
  }

  getTopPages() {
    // Implementar lógica para obtener páginas más visitadas
    return [];
  }

  getTopEvents() {
    // Implementar lógica para obtener eventos más frecuentes
    return [];
  }

  getUserEngagement() {
    // Implementar lógica para calcular engagement
    return 0;
  }

  getSystemPerformance() {
    // Implementar lógica para calcular performance
    return 0;
  }

  // Métodos de utilidad
  setUserId(userId) {
    this.session.userId = userId;
    if (window.gtag) {
      gtag('config', this.gaId, {
        user_id: userId,
      });
    }
  }

  setUserProperties(properties) {
    if (window.gtag) {
      gtag('set', properties);
    }
  }

  getMetrics() {
    this.updateUserMetrics();
    return this.metrics;
  }

  getEvents() {
    return this.events;
  }

  getSessionData() {
    return this.session;
  }

  // Métodos de exportación
  exportAnalyticsData() {
    const data = {
      metrics: this.getMetrics(),
      events: this.getEvents(),
      session: this.getSessionData(),
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_analytics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  // Métodos de limpieza
  clearAnalyticsData() {
    this.events = [];
    this.metrics = {};
    this.session = {
      startTime: Date.now(),
      pageViews: 0,
      events: 0,
      userId: null,
    };
  }
}

// Inicializar sistema de analytics
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraAnalytics = new AxyraAnalyticsSystem();
    console.log('✅ Sistema de Analytics AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de analytics:', error);
  }
});

// Exportar para uso global
window.AxyraAnalyticsSystem = AxyraAnalyticsSystem;

// ========================================
// AXYRA RBAC SYSTEM
// Sistema de control de acceso basado en roles
// ========================================

class AxyraRBACSystem {
  constructor() {
    this.roles = new Map();
    this.permissions = new Map();
    this.userRoles = new Map();
    this.roleHierarchy = new Map();
    this.accessPolicies = new Map();

    this.rbacSettings = {
      enableRoleHierarchy: true,
      enablePermissionInheritance: true,
      enableDynamicRoles: true,
      enableAccessLogging: true,
      enableAccessControl: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutos
      maxFailedAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutos
    };

    this.init();
  }

  async init() {
    console.log('👥 Inicializando Sistema RBAC AXYRA...');

    try {
      await this.loadRBACConfiguration();
      this.setupDefaultRoles();
      this.setupDefaultPermissions();
      this.setupAccessPolicies();
      this.setupAccessControl();
      this.setupAccessLogging();
      this.setupSessionManagement();
      console.log('✅ Sistema RBAC AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema RBAC:', error);
    }
  }

  async loadRBACConfiguration() {
    try {
      const config = localStorage.getItem('axyra_rbac_config');
      if (config) {
        const parsedConfig = JSON.parse(config);
        this.roles = new Map(parsedConfig.roles || []);
        this.permissions = new Map(parsedConfig.permissions || []);
        this.userRoles = new Map(parsedConfig.userRoles || []);
        this.roleHierarchy = new Map(parsedConfig.roleHierarchy || []);
        this.accessPolicies = new Map(parsedConfig.accessPolicies || []);
      }

      const settings = localStorage.getItem('axyra_rbac_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.rbacSettings = { ...this.rbacSettings, ...parsedSettings };
      }
    } catch (error) {
      console.error('❌ Error cargando configuración RBAC:', error);
    }
  }

  setupDefaultRoles() {
    // Roles por defecto del sistema
    const defaultRoles = [
      {
        id: 'super_admin',
        name: 'Super Administrador',
        description: 'Acceso completo al sistema',
        level: 100,
        permissions: ['*'],
        isSystem: true,
      },
      {
        id: 'admin',
        name: 'Administrador',
        description: 'Administración del sistema',
        level: 90,
        permissions: [
          'user_management',
          'employee_management',
          'payroll_management',
          'inventory_management',
          'reports_access',
          'settings_access',
        ],
        isSystem: true,
      },
      {
        id: 'hr_manager',
        name: 'Gerente de RRHH',
        description: 'Gestión de recursos humanos',
        level: 80,
        permissions: ['employee_management', 'payroll_management', 'reports_access'],
        isSystem: true,
      },
      {
        id: 'hr_staff',
        name: 'Personal de RRHH',
        description: 'Personal de recursos humanos',
        level: 70,
        permissions: ['employee_view', 'payroll_view', 'reports_view'],
        isSystem: true,
      },
      {
        id: 'inventory_manager',
        name: 'Gerente de Inventario',
        description: 'Gestión de inventario',
        level: 80,
        permissions: ['inventory_management', 'inventory_reports', 'supplier_management'],
        isSystem: true,
      },
      {
        id: 'inventory_staff',
        name: 'Personal de Inventario',
        description: 'Personal de inventario',
        level: 70,
        permissions: ['inventory_view', 'inventory_update', 'inventory_reports'],
        isSystem: true,
      },
      {
        id: 'finance_manager',
        name: 'Gerente Financiero',
        description: 'Gestión financiera',
        level: 80,
        permissions: ['financial_management', 'payroll_management', 'reports_access', 'financial_reports'],
        isSystem: true,
      },
      {
        id: 'finance_staff',
        name: 'Personal Financiero',
        description: 'Personal financiero',
        level: 70,
        permissions: ['financial_view', 'payroll_view', 'financial_reports'],
        isSystem: true,
      },
      {
        id: 'employee',
        name: 'Empleado',
        description: 'Empleado del sistema',
        level: 50,
        permissions: ['profile_view', 'profile_update', 'timesheet_view', 'timesheet_update'],
        isSystem: true,
      },
      {
        id: 'guest',
        name: 'Invitado',
        description: 'Acceso limitado',
        level: 10,
        permissions: ['profile_view'],
        isSystem: true,
      },
    ];

    defaultRoles.forEach((role) => {
      this.roles.set(role.id, role);
    });
  }

  setupDefaultPermissions() {
    // Permisos por defecto del sistema
    const defaultPermissions = [
      // Permisos de usuario
      { id: 'user_management', name: 'Gestión de Usuarios', category: 'users' },
      { id: 'user_view', name: 'Ver Usuarios', category: 'users' },
      { id: 'user_create', name: 'Crear Usuarios', category: 'users' },
      { id: 'user_update', name: 'Actualizar Usuarios', category: 'users' },
      { id: 'user_delete', name: 'Eliminar Usuarios', category: 'users' },

      // Permisos de empleados
      { id: 'employee_management', name: 'Gestión de Empleados', category: 'employees' },
      { id: 'employee_view', name: 'Ver Empleados', category: 'employees' },
      { id: 'employee_create', name: 'Crear Empleados', category: 'employees' },
      { id: 'employee_update', name: 'Actualizar Empleados', category: 'employees' },
      { id: 'employee_delete', name: 'Eliminar Empleados', category: 'employees' },

      // Permisos de nómina
      { id: 'payroll_management', name: 'Gestión de Nómina', category: 'payroll' },
      { id: 'payroll_view', name: 'Ver Nómina', category: 'payroll' },
      { id: 'payroll_create', name: 'Crear Nómina', category: 'payroll' },
      { id: 'payroll_update', name: 'Actualizar Nómina', category: 'payroll' },
      { id: 'payroll_delete', name: 'Eliminar Nómina', category: 'payroll' },

      // Permisos de inventario
      { id: 'inventory_management', name: 'Gestión de Inventario', category: 'inventory' },
      { id: 'inventory_view', name: 'Ver Inventario', category: 'inventory' },
      { id: 'inventory_create', name: 'Crear Inventario', category: 'inventory' },
      { id: 'inventory_update', name: 'Actualizar Inventario', category: 'inventory' },
      { id: 'inventory_delete', name: 'Eliminar Inventario', category: 'inventory' },

      // Permisos de reportes
      { id: 'reports_access', name: 'Acceso a Reportes', category: 'reports' },
      { id: 'reports_view', name: 'Ver Reportes', category: 'reports' },
      { id: 'reports_create', name: 'Crear Reportes', category: 'reports' },
      { id: 'reports_export', name: 'Exportar Reportes', category: 'reports' },

      // Permisos de configuración
      { id: 'settings_access', name: 'Acceso a Configuración', category: 'settings' },
      { id: 'settings_view', name: 'Ver Configuración', category: 'settings' },
      { id: 'settings_update', name: 'Actualizar Configuración', category: 'settings' },

      // Permisos de perfil
      { id: 'profile_view', name: 'Ver Perfil', category: 'profile' },
      { id: 'profile_update', name: 'Actualizar Perfil', category: 'profile' },

      // Permisos de timesheet
      { id: 'timesheet_view', name: 'Ver Timesheet', category: 'timesheet' },
      { id: 'timesheet_update', name: 'Actualizar Timesheet', category: 'timesheet' },

      // Permisos financieros
      { id: 'financial_management', name: 'Gestión Financiera', category: 'financial' },
      { id: 'financial_view', name: 'Ver Financiero', category: 'financial' },
      { id: 'financial_reports', name: 'Reportes Financieros', category: 'financial' },
    ];

    defaultPermissions.forEach((permission) => {
      this.permissions.set(permission.id, permission);
    });
  }

  setupAccessPolicies() {
    // Políticas de acceso por defecto
    const defaultPolicies = [
      {
        id: 'admin_policy',
        name: 'Política de Administrador',
        description: 'Política para administradores',
        roles: ['admin', 'super_admin'],
        permissions: ['*'],
        conditions: {
          timeRestrictions: {
            start: '00:00',
            end: '23:59',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          },
          ipRestrictions: [],
          deviceRestrictions: [],
        },
      },
      {
        id: 'hr_policy',
        name: 'Política de RRHH',
        description: 'Política para personal de RRHH',
        roles: ['hr_manager', 'hr_staff'],
        permissions: ['employee_management', 'payroll_management', 'reports_access'],
        conditions: {
          timeRestrictions: {
            start: '08:00',
            end: '18:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          },
          ipRestrictions: [],
          deviceRestrictions: [],
        },
      },
      {
        id: 'employee_policy',
        name: 'Política de Empleado',
        description: 'Política para empleados',
        roles: ['employee'],
        permissions: ['profile_view', 'profile_update', 'timesheet_view', 'timesheet_update'],
        conditions: {
          timeRestrictions: {
            start: '06:00',
            end: '22:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          },
          ipRestrictions: [],
          deviceRestrictions: [],
        },
      },
    ];

    defaultPolicies.forEach((policy) => {
      this.accessPolicies.set(policy.id, policy);
    });
  }

  setupAccessControl() {
    // Configurar control de acceso
    this.setupPermissionChecks();
    this.setupRoleChecks();
    this.setupAccessRestrictions();
  }

  setupPermissionChecks() {
    // Interceptar acciones que requieren permisos
    this.interceptProtectedActions();
    this.interceptProtectedRoutes();
    this.interceptProtectedElements();
  }

  interceptProtectedActions() {
    // Interceptar acciones protegidas
    const protectedActions = [
      'user_management',
      'employee_management',
      'payroll_management',
      'inventory_management',
      'reports_access',
      'settings_access',
    ];

    protectedActions.forEach((action) => {
      document.addEventListener(action, (event) => {
        if (!this.hasPermission(action)) {
          event.preventDefault();
          this.showAccessDeniedMessage(action);
        }
      });
    });
  }

  interceptProtectedRoutes() {
    // Interceptar rutas protegidas
    const protectedRoutes = ['/admin', '/employees', '/payroll', '/inventory', '/reports', '/settings'];

    protectedRoutes.forEach((route) => {
      if (window.location.pathname.includes(route)) {
        if (!this.hasRoutePermission(route)) {
          this.redirectToUnauthorized();
        }
      }
    });
  }

  interceptProtectedElements() {
    // Interceptar elementos protegidos
    const protectedElements = document.querySelectorAll('[data-permission]');
    protectedElements.forEach((element) => {
      const permission = element.dataset.permission;
      if (!this.hasPermission(permission)) {
        element.style.display = 'none';
      }
    });
  }

  setupAccessLogging() {
    if (!this.rbacSettings.enableAccessLogging) return;

    // Registrar accesos
    this.logAccessAttempts();
    this.logPermissionChecks();
    this.logRoleChanges();
  }

  logAccessAttempts() {
    // Registrar intentos de acceso
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0];
      const options = args[1] || {};

      if (this.isProtectedEndpoint(url)) {
        this.logAccessAttempt(url, options);
      }

      return originalFetch(...args);
    };
  }

  logPermissionChecks() {
    // Registrar verificaciones de permisos
    const originalHasPermission = this.hasPermission;
    this.hasPermission = (permission) => {
      const result = originalHasPermission.call(this, permission);

      this.logPermissionCheck(permission, result);

      return result;
    };
  }

  logRoleChanges() {
    // Registrar cambios de roles
    const originalAssignRole = this.assignRole;
    this.assignRole = (userId, roleId) => {
      const result = originalAssignRole.call(this, userId, roleId);

      this.logRoleChange(userId, roleId, 'assigned');

      return result;
    };
  }

  setupSessionManagement() {
    // Gestionar sesiones
    this.setupSessionTimeout();
    this.setupSessionValidation();
    this.setupSessionCleanup();
  }

  setupSessionTimeout() {
    // Configurar timeout de sesión
    let sessionTimeout;

    const resetSessionTimeout = () => {
      clearTimeout(sessionTimeout);
      sessionTimeout = setTimeout(() => {
        this.handleSessionTimeout();
      }, this.rbacSettings.sessionTimeout);
    };

    // Resetear timeout en actividad
    document.addEventListener('click', resetSessionTimeout);
    document.addEventListener('keydown', resetSessionTimeout);
    document.addEventListener('mousemove', resetSessionTimeout);

    // Iniciar timeout
    resetSessionTimeout();
  }

  setupSessionValidation() {
    // Validar sesión periódicamente
    setInterval(() => {
      this.validateSession();
    }, 5 * 60 * 1000); // Cada 5 minutos
  }

  setupSessionCleanup() {
    // Limpiar sesiones expiradas
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000); // Cada hora
  }

  // Métodos de gestión de roles
  createRole(roleData) {
    try {
      const role = {
        id: roleData.id,
        name: roleData.name,
        description: roleData.description,
        level: roleData.level || 50,
        permissions: roleData.permissions || [],
        isSystem: roleData.isSystem || false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.roles.set(role.id, role);
      this.saveRBACConfiguration();

      console.log('✅ Rol creado:', role.id);
      return { success: true, role: role };
    } catch (error) {
      console.error('❌ Error creando rol:', error);
      return { success: false, error: error.message };
    }
  }

  updateRole(roleId, roleData) {
    try {
      const role = this.roles.get(roleId);
      if (!role) {
        throw new Error('Rol no encontrado');
      }

      if (role.isSystem) {
        throw new Error('No se puede modificar un rol del sistema');
      }

      const updatedRole = {
        ...role,
        ...roleData,
        updatedAt: Date.now(),
      };

      this.roles.set(roleId, updatedRole);
      this.saveRBACConfiguration();

      console.log('✅ Rol actualizado:', roleId);
      return { success: true, role: updatedRole };
    } catch (error) {
      console.error('❌ Error actualizando rol:', error);
      return { success: false, error: error.message };
    }
  }

  deleteRole(roleId) {
    try {
      const role = this.roles.get(roleId);
      if (!role) {
        throw new Error('Rol no encontrado');
      }

      if (role.isSystem) {
        throw new Error('No se puede eliminar un rol del sistema');
      }

      // Verificar si hay usuarios con este rol
      const usersWithRole = Array.from(this.userRoles.entries()).filter(([userId, roles]) => roles.includes(roleId));

      if (usersWithRole.length > 0) {
        throw new Error('No se puede eliminar un rol que está asignado a usuarios');
      }

      this.roles.delete(roleId);
      this.saveRBACConfiguration();

      console.log('✅ Rol eliminado:', roleId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando rol:', error);
      return { success: false, error: error.message };
    }
  }

  // Métodos de gestión de permisos
  createPermission(permissionData) {
    try {
      const permission = {
        id: permissionData.id,
        name: permissionData.name,
        description: permissionData.description,
        category: permissionData.category || 'general',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.permissions.set(permission.id, permission);
      this.saveRBACConfiguration();

      console.log('✅ Permiso creado:', permission.id);
      return { success: true, permission: permission };
    } catch (error) {
      console.error('❌ Error creando permiso:', error);
      return { success: false, error: error.message };
    }
  }

  updatePermission(permissionId, permissionData) {
    try {
      const permission = this.permissions.get(permissionId);
      if (!permission) {
        throw new Error('Permiso no encontrado');
      }

      const updatedPermission = {
        ...permission,
        ...permissionData,
        updatedAt: Date.now(),
      };

      this.permissions.set(permissionId, updatedPermission);
      this.saveRBACConfiguration();

      console.log('✅ Permiso actualizado:', permissionId);
      return { success: true, permission: updatedPermission };
    } catch (error) {
      console.error('❌ Error actualizando permiso:', error);
      return { success: false, error: error.message };
    }
  }

  deletePermission(permissionId) {
    try {
      const permission = this.permissions.get(permissionId);
      if (!permission) {
        throw new Error('Permiso no encontrado');
      }

      // Verificar si hay roles con este permiso
      const rolesWithPermission = Array.from(this.roles.values()).filter((role) =>
        role.permissions.includes(permissionId)
      );

      if (rolesWithPermission.length > 0) {
        throw new Error('No se puede eliminar un permiso que está asignado a roles');
      }

      this.permissions.delete(permissionId);
      this.saveRBACConfiguration();

      console.log('✅ Permiso eliminado:', permissionId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando permiso:', error);
      return { success: false, error: error.message };
    }
  }

  // Métodos de asignación de roles
  assignRole(userId, roleId) {
    try {
      if (!this.roles.has(roleId)) {
        throw new Error('Rol no encontrado');
      }

      const userRoles = this.userRoles.get(userId) || [];
      if (!userRoles.includes(roleId)) {
        userRoles.push(roleId);
        this.userRoles.set(userId, userRoles);
        this.saveRBACConfiguration();

        console.log('✅ Rol asignado:', userId, '->', roleId);
        return { success: true };
      }

      return { success: true, message: 'Rol ya asignado' };
    } catch (error) {
      console.error('❌ Error asignando rol:', error);
      return { success: false, error: error.message };
    }
  }

  removeRole(userId, roleId) {
    try {
      const userRoles = this.userRoles.get(userId) || [];
      const index = userRoles.indexOf(roleId);

      if (index > -1) {
        userRoles.splice(index, 1);
        this.userRoles.set(userId, userRoles);
        this.saveRBACConfiguration();

        console.log('✅ Rol removido:', userId, '->', roleId);
        return { success: true };
      }

      return { success: true, message: 'Rol no asignado' };
    } catch (error) {
      console.error('❌ Error removiendo rol:', error);
      return { success: false, error: error.message };
    }
  }

  // Métodos de verificación de permisos
  hasPermission(permission) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return false;
      }

      const userRoles = this.userRoles.get(currentUser.id) || [];

      // Verificar si el usuario tiene el permiso directamente
      for (const roleId of userRoles) {
        const role = this.roles.get(roleId);
        if (role && (role.permissions.includes(permission) || role.permissions.includes('*'))) {
          return true;
        }
      }

      // Verificar herencia de roles
      if (this.rbacSettings.enableRoleHierarchy) {
        for (const roleId of userRoles) {
          if (this.hasPermissionThroughHierarchy(roleId, permission)) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Error verificando permiso:', error);
      return false;
    }
  }

  hasPermissionThroughHierarchy(roleId, permission) {
    const role = this.roles.get(roleId);
    if (!role) return false;

    // Verificar si el rol tiene el permiso
    if (role.permissions.includes(permission) || role.permissions.includes('*')) {
      return true;
    }

    // Verificar roles padre
    const parentRoles = this.roleHierarchy.get(roleId) || [];
    for (const parentRoleId of parentRoles) {
      if (this.hasPermissionThroughHierarchy(parentRoleId, permission)) {
        return true;
      }
    }

    return false;
  }

  hasRole(roleId) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return false;
      }

      const userRoles = this.userRoles.get(currentUser.id) || [];
      return userRoles.includes(roleId);
    } catch (error) {
      console.error('❌ Error verificando rol:', error);
      return false;
    }
  }

  hasAnyRole(roleIds) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return false;
      }

      const userRoles = this.userRoles.get(currentUser.id) || [];
      return roleIds.some((roleId) => userRoles.includes(roleId));
    } catch (error) {
      console.error('❌ Error verificando roles:', error);
      return false;
    }
  }

  hasAllRoles(roleIds) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return false;
      }

      const userRoles = this.userRoles.get(currentUser.id) || [];
      return roleIds.every((roleId) => userRoles.includes(roleId));
    } catch (error) {
      console.error('❌ Error verificando roles:', error);
      return false;
    }
  }

  // Métodos de verificación de acceso
  hasRoutePermission(route) {
    try {
      const routePermissions = this.getRoutePermissions(route);
      return routePermissions.every((permission) => this.hasPermission(permission));
    } catch (error) {
      console.error('❌ Error verificando permiso de ruta:', error);
      return false;
    }
  }

  getRoutePermissions(route) {
    const routePermissionMap = {
      '/admin': ['admin_access'],
      '/employees': ['employee_view'],
      '/payroll': ['payroll_view'],
      '/inventory': ['inventory_view'],
      '/reports': ['reports_view'],
      '/settings': ['settings_view'],
    };

    return routePermissionMap[route] || [];
  }

  // Métodos de gestión de sesiones
  handleSessionTimeout() {
    console.log('⏰ Sesión expirada');

    // Limpiar sesión
    this.clearUserSession();

    // Redirigir a login
    window.location.href = '/login-optimized.html';
  }

  validateSession() {
    try {
      const sessionData = localStorage.getItem('axyra_user_session');
      if (!sessionData) {
        this.handleSessionTimeout();
        return false;
      }

      const session = JSON.parse(sessionData);
      const now = Date.now();

      if (now > session.expiresAt) {
        this.handleSessionTimeout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error validando sesión:', error);
      this.handleSessionTimeout();
      return false;
    }
  }

  clearUserSession() {
    localStorage.removeItem('axyra_user_session');
    localStorage.removeItem('axyra_user_roles');
    localStorage.removeItem('axyra_user_permissions');
  }

  cleanupExpiredSessions() {
    // Limpiar sesiones expiradas
    const now = Date.now();
    const expiredSessions = [];

    for (const [userId, sessionData] of this.userRoles.entries()) {
      if (sessionData.expiresAt && now > sessionData.expiresAt) {
        expiredSessions.push(userId);
      }
    }

    expiredSessions.forEach((userId) => {
      this.userRoles.delete(userId);
    });

    if (expiredSessions.length > 0) {
      this.saveRBACConfiguration();
      console.log('🧹 Sesiones expiradas limpiadas:', expiredSessions.length);
    }
  }

  // Métodos de utilidad
  getCurrentUser() {
    try {
      const sessionData = localStorage.getItem('axyra_user_session');
      if (sessionData) {
        return JSON.parse(sessionData);
      }
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      return null;
    }
  }

  getCurrentUserRoles() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return [];
      }

      return this.userRoles.get(currentUser.id) || [];
    } catch (error) {
      console.error('❌ Error obteniendo roles del usuario:', error);
      return [];
    }
  }

  getCurrentUserPermissions() {
    try {
      const userRoles = this.getCurrentUserRoles();
      const permissions = new Set();

      userRoles.forEach((roleId) => {
        const role = this.roles.get(roleId);
        if (role) {
          role.permissions.forEach((permission) => {
            permissions.add(permission);
          });
        }
      });

      return Array.from(permissions);
    } catch (error) {
      console.error('❌ Error obteniendo permisos del usuario:', error);
      return [];
    }
  }

  // Métodos de logging
  logAccessAttempt(url, options) {
    const logEntry = {
      url: url,
      method: options.method || 'GET',
      timestamp: Date.now(),
      user: this.getCurrentUser()?.id,
      roles: this.getCurrentUserRoles(),
      permissions: this.getCurrentUserPermissions(),
    };

    this.saveAccessLog(logEntry);
  }

  logPermissionCheck(permission, result) {
    const logEntry = {
      permission: permission,
      result: result,
      timestamp: Date.now(),
      user: this.getCurrentUser()?.id,
      roles: this.getCurrentUserRoles(),
    };

    this.savePermissionLog(logEntry);
  }

  logRoleChange(userId, roleId, action) {
    const logEntry = {
      userId: userId,
      roleId: roleId,
      action: action,
      timestamp: Date.now(),
      changedBy: this.getCurrentUser()?.id,
    };

    this.saveRoleChangeLog(logEntry);
  }

  saveAccessLog(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('axyra_access_logs') || '[]');
      logs.push(logEntry);

      // Mantener solo los últimos 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }

      localStorage.setItem('axyra_access_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('❌ Error guardando log de acceso:', error);
    }
  }

  savePermissionLog(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('axyra_permission_logs') || '[]');
      logs.push(logEntry);

      // Mantener solo los últimos 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }

      localStorage.setItem('axyra_permission_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('❌ Error guardando log de permisos:', error);
    }
  }

  saveRoleChangeLog(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('axyra_role_change_logs') || '[]');
      logs.push(logEntry);

      // Mantener solo los últimos 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }

      localStorage.setItem('axyra_role_change_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('❌ Error guardando log de cambios de rol:', error);
    }
  }

  // Métodos de utilidad
  isProtectedEndpoint(url) {
    const protectedEndpoints = [
      '/api/users',
      '/api/employees',
      '/api/payroll',
      '/api/inventory',
      '/api/reports',
      '/api/settings',
    ];

    return protectedEndpoints.some((endpoint) => url.includes(endpoint));
  }

  showAccessDeniedMessage(permission) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showError('Acceso denegado', {
        message: `No tienes permisos para realizar esta acción: ${permission}`,
        persistent: true,
      });
    }
  }

  redirectToUnauthorized() {
    window.location.href = '/unauthorized.html';
  }

  // Métodos de guardado
  saveRBACConfiguration() {
    try {
      const config = {
        roles: Array.from(this.roles.entries()),
        permissions: Array.from(this.permissions.entries()),
        userRoles: Array.from(this.userRoles.entries()),
        roleHierarchy: Array.from(this.roleHierarchy.entries()),
        accessPolicies: Array.from(this.accessPolicies.entries()),
      };

      localStorage.setItem('axyra_rbac_config', JSON.stringify(config));
    } catch (error) {
      console.error('❌ Error guardando configuración RBAC:', error);
    }
  }

  // Métodos de exportación
  exportRBACLogs() {
    const data = {
      accessLogs: JSON.parse(localStorage.getItem('axyra_access_logs') || '[]'),
      permissionLogs: JSON.parse(localStorage.getItem('axyra_permission_logs') || '[]'),
      roleChangeLogs: JSON.parse(localStorage.getItem('axyra_role_change_logs') || '[]'),
      timestamp: new Date().toISOString(),
      device: this.getCurrentDeviceInfo(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_rbac_logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  getCurrentDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
  }

  // Métodos de limpieza
  clearRBACLogs() {
    localStorage.removeItem('axyra_access_logs');
    localStorage.removeItem('axyra_permission_logs');
    localStorage.removeItem('axyra_role_change_logs');
  }

  // Métodos de limpieza
  destroy() {
    this.roles.clear();
    this.permissions.clear();
    this.userRoles.clear();
    this.roleHierarchy.clear();
    this.accessPolicies.clear();
  }
}

// Inicializar sistema RBAC
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraRBAC = new AxyraRBACSystem();
    console.log('✅ Sistema RBAC AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema RBAC:', error);
  }
});

// Exportar para uso global
window.AxyraRBACSystem = AxyraRBACSystem;

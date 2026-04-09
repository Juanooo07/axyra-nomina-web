// ========================================
// MÓDULO DE CUADRE DE CAJA OPTIMIZADO PARA PRODUCCIÓN
// ========================================

class CuadreCajaOptimized {
  constructor() {
    this.movimientos = [];
    this.cortes = [];
    this.saldoInicial = 0;
    this.saldoActual = 0;
    this.isOnline = navigator.onLine;
    this.pendingSync = [];
    this.retryAttempts = 3;
    this.retryDelay = 1000;

    this.init();
  }

  async init() {
    try {
      console.log('💰 Inicializando Cuadre de Caja Optimizado...');

      // Configurar listeners de conectividad
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());

      // Inicializar sistemas de apoyo
      if (typeof FirebaseSyncManager !== 'undefined') {
        this.firebaseSyncManager = new FirebaseSyncManager();
        await this.firebaseSyncManager.init();
      }

      // Cargar datos
      await this.cargarDatos();

      // Configurar eventos
      this.configurarEventos();

      // Actualizar saldo
      this.actualizarSaldo();

      console.log('✅ Cuadre de Caja Optimizado inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar Cuadre de Caja:', error);
      this.mostrarNotificacion('Error al inicializar el sistema de cuadre de caja', 'error');
    }
  }

  // ========================================
  // MANEJO DE CONECTIVIDAD
  // ========================================

  handleOnline() {
    this.isOnline = true;
    console.log('🌐 Conexión restaurada, sincronizando datos de caja...');
    this.syncPendingData();
  }

  handleOffline() {
    this.isOnline = false;
    console.log('📡 Conexión perdida, trabajando en modo offline...');
  }

  // ========================================
  // CARGA DE DATOS OPTIMIZADA
  // ========================================

  async cargarDatos() {
    try {
      if (this.firebaseSyncManager && this.isOnline) {
        // Cargar desde Firebase con fallback a localStorage
        this.movimientos = await this.firebaseSyncManager.getMovimientosCaja();
        this.cortes = await this.firebaseSyncManager.getCortesCaja();
      } else {
        // Cargar desde localStorage
        this.movimientos = this.loadFromStorage('axyra_movimientos_caja') || [];
        this.cortes = this.loadFromStorage('axyra_cortes_caja') || [];
      }

      // Renderizar datos
      this.renderizarMovimientos();
      this.renderizarCortes();
      this.actualizarSaldo();

      console.log('✅ Datos de caja cargados correctamente:', {
        movimientos: this.movimientos.length,
        cortes: this.cortes.length,
      });
    } catch (error) {
      console.error('❌ Error al cargar datos de caja:', error);
      this.mostrarNotificacion('Error al cargar datos del sistema de caja', 'error');
    }
  }

  // ========================================
  // GESTIÓN DE MOVIMIENTOS DE CAJA
  // ========================================

  async registrarMovimiento(movimientoData) {
    try {
      // Validar datos
      const validation = this.validarMovimiento(movimientoData);
      if (!validation.valid) {
        this.mostrarNotificacion(validation.message, 'error');
        return false;
      }

      // Preparar datos del movimiento
      const movimiento = {
        id: this.generateId(),
        ...movimientoData,
        companyId: this.getCompanyId(),
        userId: this.getCurrentUserId(),
        fecha: movimientoData.fecha || new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().split(' ')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Guardar en Firebase o localStorage
      if (this.firebaseSyncManager && this.isOnline) {
        await this.firebaseSyncManager.saveMovimientoCaja(movimiento);
      } else {
        this.saveToStorage('axyra_movimientos_caja', movimiento);
        this.pendingSync.push({ type: 'movimiento', data: movimiento, action: 'save' });
      }

      // Actualizar lista local
      this.movimientos.push(movimiento);

      // Actualizar saldo
      this.actualizarSaldo();

      this.mostrarNotificacion('Movimiento registrado correctamente', 'success');
      this.renderizarMovimientos();

      return true;
    } catch (error) {
      console.error('❌ Error al registrar movimiento:', error);
      this.mostrarNotificacion('Error al registrar movimiento', 'error');
      return false;
    }
  }

  async eliminarMovimiento(movimientoId) {
    try {
      if (!confirm('¿Está seguro de que desea eliminar este movimiento?')) {
        return false;
      }

      // Eliminar de Firebase o localStorage
      if (this.firebaseSyncManager && this.isOnline) {
        await this.firebaseSyncManager.deleteMovimientoCaja(movimientoId);
      } else {
        this.deleteFromStorage('axyra_movimientos_caja', movimientoId);
        this.pendingSync.push({ type: 'movimiento', data: { id: movimientoId }, action: 'delete' });
      }

      // Actualizar lista local
      this.movimientos = this.movimientos.filter((mov) => mov.id !== movimientoId);

      // Actualizar saldo
      this.actualizarSaldo();

      this.mostrarNotificacion('Movimiento eliminado correctamente', 'success');
      this.renderizarMovimientos();

      return true;
    } catch (error) {
      console.error('❌ Error al eliminar movimiento:', error);
      this.mostrarNotificacion('Error al eliminar movimiento', 'error');
      return false;
    }
  }

  // ========================================
  // GESTIÓN DE CORTES DE CAJA
  // ========================================

  async realizarCorte(corteData) {
    try {
      // Validar datos
      if (!corteData.fecha || !corteData.saldoInicial) {
        this.mostrarNotificacion('La fecha y el saldo inicial son obligatorios', 'error');
        return false;
      }

      // Calcular saldo final
      const saldoFinal = this.calcularSaldoFinal(corteData.fecha);
      const diferencia = saldoFinal - parseFloat(corteData.saldoInicial);

      // Preparar datos del corte
      const corte = {
        id: this.generateId(),
        ...corteData,
        saldoFinal: saldoFinal,
        diferencia: diferencia,
        companyId: this.getCompanyId(),
        userId: this.getCurrentUserId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Guardar en Firebase o localStorage
      if (this.firebaseSyncManager && this.isOnline) {
        await this.firebaseSyncManager.saveCorteCaja(corte);
      } else {
        this.saveToStorage('axyra_cortes_caja', corte);
        this.pendingSync.push({ type: 'corte', data: corte, action: 'save' });
      }

      // Actualizar lista local
      this.cortes.push(corte);

      this.mostrarNotificacion('Corte realizado correctamente', 'success');
      this.renderizarCortes();

      return true;
    } catch (error) {
      console.error('❌ Error al realizar corte:', error);
      this.mostrarNotificacion('Error al realizar corte', 'error');
      return false;
    }
  }

  // ========================================
  // CÁLCULOS DE SALDO
  // ========================================

  actualizarSaldo() {
    try {
      // Calcular saldo actual basado en movimientos
      let saldo = 0;

      this.movimientos.forEach((movimiento) => {
        if (movimiento.tipo === 'ingreso') {
          saldo += parseFloat(movimiento.monto);
        } else if (movimiento.tipo === 'egreso') {
          saldo -= parseFloat(movimiento.monto);
        }
      });

      this.saldoActual = saldo;

      // Actualizar UI
      const saldoElement = document.getElementById('saldoActual');
      if (saldoElement) {
        saldoElement.textContent = this.formatearMoneda(saldo);
        saldoElement.className = saldo >= 0 ? 'saldo-positivo' : 'saldo-negativo';
      }

      console.log('💰 Saldo actualizado:', this.formatearMoneda(saldo));
    } catch (error) {
      console.error('❌ Error al actualizar saldo:', error);
    }
  }

  calcularSaldoFinal(fecha) {
    let saldo = 0;

    this.movimientos
      .filter((mov) => mov.fecha === fecha)
      .forEach((movimiento) => {
        if (movimiento.tipo === 'ingreso') {
          saldo += parseFloat(movimiento.monto);
        } else if (movimiento.tipo === 'egreso') {
          saldo -= parseFloat(movimiento.monto);
        }
      });

    return saldo;
  }

  // ========================================
  // VALIDACIONES
  // ========================================

  validarMovimiento(movimiento) {
    if (!movimiento.concepto || movimiento.concepto.trim() === '') {
      return { valid: false, message: 'El concepto es obligatorio' };
    }
    if (!movimiento.monto || parseFloat(movimiento.monto) <= 0) {
      return { valid: false, message: 'El monto debe ser mayor a 0' };
    }
    if (!movimiento.tipo || !['ingreso', 'egreso'].includes(movimiento.tipo)) {
      return { valid: false, message: 'El tipo de movimiento es obligatorio' };
    }
    return { valid: true };
  }

  // ========================================
  // UTILIDADES
  // ========================================

  generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getCompanyId() {
    return localStorage.getItem('axyra_company_id') || 'default_company';
  }

  getCurrentUserId() {
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
      return firebase.auth().currentUser.uid;
    }
    return localStorage.getItem('currentUserId') || 'default_user';
  }

  formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  }

  // ========================================
  // MANEJO DE ALMACENAMIENTO
  // ========================================

  loadFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error cargando desde localStorage:', error);
      return [];
    }
  }

  saveToStorage(key, item) {
    try {
      const data = this.loadFromStorage(key);
      const index = data.findIndex((item) => item.id === item.id);
      if (index >= 0) {
        data[index] = item;
      } else {
        data.push(item);
      }
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  }

  deleteFromStorage(key, id) {
    try {
      const data = this.loadFromStorage(key);
      const filteredData = data.filter((item) => item.id !== id);
      localStorage.setItem(key, JSON.stringify(filteredData));
    } catch (error) {
      console.error('Error eliminando de localStorage:', error);
    }
  }

  // ========================================
  // SINCRONIZACIÓN PENDIENTE
  // ========================================

  async syncPendingData() {
    if (!this.isOnline || !this.firebaseSyncManager) return;

    try {
      for (const pending of this.pendingSync) {
        switch (pending.type) {
          case 'movimiento':
            if (pending.action === 'save') {
              await this.firebaseSyncManager.saveMovimientoCaja(pending.data);
            } else if (pending.action === 'delete') {
              await this.firebaseSyncManager.deleteMovimientoCaja(pending.data.id);
            }
            break;
          case 'corte':
            if (pending.action === 'save') {
              await this.firebaseSyncManager.saveCorteCaja(pending.data);
            }
            break;
        }
      }

      this.pendingSync = [];
      console.log('✅ Datos de caja pendientes sincronizados');
    } catch (error) {
      console.error('❌ Error sincronizando datos de caja pendientes:', error);
    }
  }

  // ========================================
  // RENDERIZADO OPTIMIZADO
  // ========================================

  renderizarMovimientos() {
    const container = document.getElementById('cuerpoMovimientos');
    if (!container) return;

    let html = '';
    this.movimientos
      .sort((a, b) => new Date(b.fecha + ' ' + b.hora) - new Date(a.fecha + ' ' + a.hora))
      .forEach((movimiento) => {
        const monto = parseFloat(movimiento.monto);
        const esIngreso = movimiento.tipo === 'ingreso';

        html += `
          <tr>
            <td>${movimiento.fecha}</td>
            <td>${movimiento.hora}</td>
            <td>${movimiento.concepto}</td>
            <td>${movimiento.tipo}</td>
            <td class="${esIngreso ? 'text-success' : 'text-danger'}">
              ${esIngreso ? '+' : '-'}${this.formatearMoneda(monto)}
            </td>
            <td>${movimiento.observaciones || ''}</td>
            <td>
              <button class="btn btn-sm btn-outline-danger" onclick="cuadreCaja.eliminarMovimiento('${movimiento.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      });
    container.innerHTML = html;
  }

  renderizarCortes() {
    const container = document.getElementById('cuerpoCortes');
    if (!container) return;

    let html = '';
    this.cortes
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .forEach((corte) => {
        const diferencia = parseFloat(corte.diferencia);
        const esPositivo = diferencia >= 0;

        html += `
          <tr>
            <td>${corte.fecha}</td>
            <td>${this.formatearMoneda(parseFloat(corte.saldoInicial))}</td>
            <td>${this.formatearMoneda(parseFloat(corte.saldoFinal))}</td>
            <td class="${esPositivo ? 'text-success' : 'text-danger'}">
              ${esPositivo ? '+' : ''}${this.formatearMoneda(diferencia)}
            </td>
            <td>${corte.observaciones || ''}</td>
            <td>
              <button class="btn btn-sm btn-outline-info" onclick="cuadreCaja.verDetalleCorte('${corte.id}')">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        `;
      });
    container.innerHTML = html;
  }

  // ========================================
  // CONFIGURACIÓN DE EVENTOS
  // ========================================

  configurarEventos() {
    try {
      // Eventos de formularios
      const formMovimiento = document.getElementById('formMovimiento');
      if (formMovimiento) {
        formMovimiento.addEventListener('submit', (e) => this.manejarSubmitMovimiento(e));
      }

      const formCorte = document.getElementById('formCorte');
      if (formCorte) {
        formCorte.addEventListener('submit', (e) => this.manejarSubmitCorte(e));
      }

      // Eventos de botones
      this.configurarBotonesAccion();

      console.log('✅ Eventos de cuadre de caja configurados correctamente');
    } catch (error) {
      console.error('❌ Error al configurar eventos de cuadre de caja:', error);
    }
  }

  configurarBotonesAccion() {
    const btnRegistrarMovimiento = document.getElementById('btnRegistrarMovimiento');
    if (btnRegistrarMovimiento) {
      btnRegistrarMovimiento.addEventListener('click', () => this.mostrarModalMovimiento());
    }

    const btnRealizarCorte = document.getElementById('btnRealizarCorte');
    if (btnRealizarCorte) {
      btnRealizarCorte.addEventListener('click', () => this.mostrarModalCorte());
    }

    const btnExportarMovimientos = document.getElementById('btnExportarMovimientos');
    if (btnExportarMovimientos) {
      btnExportarMovimientos.addEventListener('click', () => this.exportarMovimientos());
    }

    const btnExportarCortes = document.getElementById('btnExportarCortes');
    if (btnExportarCortes) {
      btnExportarCortes.addEventListener('click', () => this.exportarCortes());
    }
  }

  // ========================================
  // MANEJO DE FORMULARIOS
  // ========================================

  async manejarSubmitMovimiento(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const movimientoData = {
        concepto: formData.get('concepto'),
        monto: parseFloat(formData.get('monto')),
        tipo: formData.get('tipo'),
        fecha: formData.get('fecha') || new Date().toISOString().split('T')[0],
        observaciones: formData.get('observaciones'),
      };

      await this.registrarMovimiento(movimientoData);
      this.cerrarModalMovimiento();
    } catch (error) {
      console.error('❌ Error al manejar submit de movimiento:', error);
      this.mostrarNotificacion('Error al procesar el formulario', 'error');
    }
  }

  async manejarSubmitCorte(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const corteData = {
        fecha: formData.get('fecha') || new Date().toISOString().split('T')[0],
        saldoInicial: parseFloat(formData.get('saldoInicial')),
        observaciones: formData.get('observaciones'),
      };

      await this.realizarCorte(corteData);
      this.cerrarModalCorte();
    } catch (error) {
      console.error('❌ Error al manejar submit de corte:', error);
      this.mostrarNotificacion('Error al procesar el formulario', 'error');
    }
  }

  // ========================================
  // FUNCIONES PÚBLICAS PARA COMPATIBILIDAD
  // ========================================

  mostrarModalMovimiento(movimientoId = null) {
    const modal = document.getElementById('modalMovimiento');
    if (!modal) return;

    const form = modal.querySelector('#formMovimiento');
    if (movimientoId) {
      const movimiento = this.movimientos.find((mov) => mov.id === movimientoId);
      if (movimiento) {
        form.querySelector('[name="concepto"]').value = movimiento.concepto;
        form.querySelector('[name="monto"]').value = movimiento.monto;
        form.querySelector('[name="tipo"]').value = movimiento.tipo;
        form.querySelector('[name="fecha"]').value = movimiento.fecha;
        form.querySelector('[name="observaciones"]').value = movimiento.observaciones || '';
      }
    } else {
      form.reset();
      form.querySelector('[name="fecha"]').value = new Date().toISOString().split('T')[0];
    }
    modal.style.display = 'block';
  }

  cerrarModalMovimiento() {
    const modal = document.getElementById('modalMovimiento');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  mostrarModalCorte() {
    const modal = document.getElementById('modalCorte');
    if (!modal) return;

    const form = modal.querySelector('#formCorte');
    form.reset();
    form.querySelector('[name="fecha"]').value = new Date().toISOString().split('T')[0];
    form.querySelector('[name="saldoInicial"]').value = this.saldoActual.toFixed(2);

    modal.style.display = 'block';
  }

  cerrarModalCorte() {
    const modal = document.getElementById('modalCorte');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  verDetalleCorte(corteId) {
    const corte = this.cortes.find((c) => c.id === corteId);
    if (!corte) return;

    const modal = document.getElementById('modalDetalleCorte');
    if (!modal) return;

    const contenido = modal.querySelector('.modal-body');
    contenido.innerHTML = `
      <div class="detalle-corte">
        <h4>Detalle del Corte - ${corte.fecha}</h4>
        <div class="detalle-grid">
          <div class="detalle-item">
            <span class="label">Saldo Inicial:</span>
            <span class="value">${this.formatearMoneda(parseFloat(corte.saldoInicial))}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Saldo Final:</span>
            <span class="value">${this.formatearMoneda(parseFloat(corte.saldoFinal))}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Diferencia:</span>
            <span class="value ${parseFloat(corte.diferencia) >= 0 ? 'text-success' : 'text-danger'}">
              ${parseFloat(corte.diferencia) >= 0 ? '+' : ''}${this.formatearMoneda(parseFloat(corte.diferencia))}
            </span>
          </div>
        </div>
        ${corte.observaciones ? `<p><strong>Observaciones:</strong> ${corte.observaciones}</p>` : ''}
      </div>
    `;
    modal.style.display = 'block';
  }

  exportarMovimientos() {
    try {
      const csv = this.generarCSVMovimientos();
      this.descargarCSV(csv, 'movimientos_caja.csv');
      this.mostrarNotificacion('Movimientos exportados correctamente', 'success');
    } catch (error) {
      console.error('❌ Error al exportar movimientos:', error);
      this.mostrarNotificacion('Error al exportar movimientos', 'error');
    }
  }

  exportarCortes() {
    try {
      const csv = this.generarCSVCortes();
      this.descargarCSV(csv, 'cortes_caja.csv');
      this.mostrarNotificacion('Cortes exportados correctamente', 'success');
    } catch (error) {
      console.error('❌ Error al exportar cortes:', error);
      this.mostrarNotificacion('Error al exportar cortes', 'error');
    }
  }

  generarCSVMovimientos() {
    const headers = ['Fecha', 'Hora', 'Concepto', 'Tipo', 'Monto', 'Observaciones'];
    const rows = this.movimientos.map((mov) => [
      mov.fecha,
      mov.hora,
      mov.concepto,
      mov.tipo,
      mov.monto,
      mov.observaciones || '',
    ]);

    return [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(',')).join('\n');
  }

  generarCSVCortes() {
    const headers = ['Fecha', 'Saldo Inicial', 'Saldo Final', 'Diferencia', 'Observaciones'];
    const rows = this.cortes.map((corte) => [
      corte.fecha,
      corte.saldoInicial,
      corte.saldoFinal,
      corte.diferencia,
      corte.observaciones || '',
    ]);

    return [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(',')).join('\n');
  }

  descargarCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  mostrarNotificacion(mensaje, tipo = 'info') {
    if (typeof mostrarNotificacionProfesional === 'function') {
      mostrarNotificacionProfesional(mensaje, tipo);
    } else if (typeof mostrarNotificacion === 'function') {
      mostrarNotificacion(mensaje, tipo);
    } else {
      alert(mensaje);
    }
  }
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  try {
    window.cuadreCaja = new CuadreCajaOptimized();
    console.log('✅ Módulo de Cuadre de Caja Optimizado cargado correctamente');
  } catch (error) {
    console.error('❌ Error al cargar módulo de Cuadre de Caja:', error);
  }
});

// Exportar para uso global
window.CuadreCajaOptimized = CuadreCajaOptimized;

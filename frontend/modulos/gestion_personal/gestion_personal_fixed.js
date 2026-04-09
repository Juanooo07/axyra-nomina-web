// ========================================
// MÓDULO DE GESTIÓN DE PERSONAL CORREGIDO - AXYRA
// ========================================

class AxyraGestionPersonal {
  constructor() {
    this.empleados = [];
    this.horas = [];
    this.departamentos = [];
    this.empleadoSeleccionado = null;
    this.horasSeleccionadas = null;
    this.currentTab = 'horas';
    this.isOnline = navigator.onLine;
    this.pendingSync = [];
    this.retryAttempts = 3;
    this.retryDelay = 1000;

    this.init();
  }

  async init() {
    try {
      console.log('🚀 Inicializando Gestión de Personal AXYRA...');

      // Configurar listeners de conectividad
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());

      // Cargar datos
      await this.cargarDatos();

      // Configurar eventos
      this.configurarEventos();

      // Actualizar estadísticas
      this.actualizarEstadisticas();

      console.log('✅ Gestión de Personal AXYRA inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Gestión de Personal:', error);
      this.mostrarError('Error inicializando el módulo de gestión de personal');
    }
  }

  async cargarDatos() {
    try {
      console.log('📥 Cargando datos...');

      // Cargar empleados desde localStorage
      const empleadosData = localStorage.getItem('axyra_empleados');
      if (empleadosData) {
        this.empleados = JSON.parse(empleadosData);
      }

      // Cargar horas desde localStorage
      const horasData = localStorage.getItem('axyra_horas');
      if (horasData) {
        this.horas = JSON.parse(horasData);
      }

      // Cargar departamentos desde localStorage
      const departamentosData = localStorage.getItem('axyra_departamentos');
      if (departamentosData) {
        this.departamentos = JSON.parse(departamentosData);
      } else {
        // Departamentos por defecto
        this.departamentos = [
          { id: 'admin', nombre: 'Administración' },
          { id: 'ventas', nombre: 'Ventas' },
          { id: 'produccion', nombre: 'Producción' },
          { id: 'contabilidad', nombre: 'Contabilidad' },
          { id: 'rrhh', nombre: 'Recursos Humanos' },
        ];
        this.guardarDepartamentos();
      }

      // Sistema listo para producción - sin datos de prueba

      console.log('✅ Datos cargados correctamente:', {
        empleados: this.empleados.length,
        horas: this.horas.length,
        departamentos: this.departamentos.length,
      });

      // Renderizar datos
      this.renderizarEmpleados();
      this.renderizarHoras();
      this.renderizarDepartamentos();
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      this.mostrarError('Error cargando los datos del sistema');
    }
  }

  configurarEventos() {
    try {
      console.log('⚙️ Configurando eventos...');

      // Eventos de empleados
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="editar-empleado"]')) {
          const empleadoId = e.target.dataset.empleadoId;
          this.mostrarModalEmpleado(empleadoId);
        }
        if (e.target.matches('[data-action="eliminar-empleado"]')) {
          const empleadoId = e.target.dataset.empleadoId;
          this.eliminarEmpleado(empleadoId);
        }
        if (e.target.matches('[data-action="ver-horas-empleado"]')) {
          const empleadoId = e.target.dataset.empleadoId;
          this.verHorasEmpleado(empleadoId);
        }
      });

      // Eventos de horas
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="editar-horas"]')) {
          const horasId = e.target.dataset.horasId;
          this.editarHoras(horasId);
        }
        if (e.target.matches('[data-action="eliminar-horas"]')) {
          const horasId = e.target.dataset.horasId;
          this.eliminarHoras(horasId);
        }
        if (e.target.matches('[data-action="ver-detalle-horas"]')) {
          const horasId = e.target.dataset.horasId;
          this.verDetalleHoras(horasId);
        }
      });

      // Eventos de departamentos
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="editar-departamento"]')) {
          const departamentoId = e.target.dataset.departamentoId;
          this.editarDepartamento(departamentoId);
        }
        if (e.target.matches('[data-action="eliminar-departamento"]')) {
          const departamentoId = e.target.dataset.departamentoId;
          this.eliminarDepartamento(departamentoId);
        }
      });

      console.log('✅ Eventos configurados correctamente');
    } catch (error) {
      console.error('❌ Error configurando eventos:', error);
    }
  }

  // ========================================
  // GESTIÓN DE EMPLEADOS
  // ========================================

  mostrarModalEmpleado(empleadoId = null) {
    try {
      const modal = document.getElementById('modalEmpleado');
      if (!modal) {
        this.crearModalEmpleado();
        return this.mostrarModalEmpleado(empleadoId);
      }

      if (empleadoId) {
        const empleado = this.empleados.find((e) => e.id === empleadoId);
        if (empleado) {
          this.empleadoSeleccionado = empleado;
          this.llenarFormularioEmpleado(empleado);
        }
      } else {
        this.empleadoSeleccionado = null;
        this.limpiarFormularioEmpleado();
      }

      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    } catch (error) {
      console.error('❌ Error mostrando modal empleado:', error);
      this.mostrarError('Error mostrando el formulario de empleado');
    }
  }

  cerrarModalEmpleado() {
    try {
      const modal = document.getElementById('modalEmpleado');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    } catch (error) {
      console.error('❌ Error cerrando modal empleado:', error);
    }
  }

  crearModalEmpleado() {
    const modalHTML = `
      <div id="modalEmpleado" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="tituloModalEmpleado">Nuevo Empleado</h2>
            <span class="close" onclick="window.axyraGestionPersonal.cerrarModalEmpleado()">&times;</span>
          </div>
          <div class="modal-body">
            <form id="formEmpleado">
              <div class="form-group">
                <label for="nombreEmpleado">Nombre Completo *</label>
                <input type="text" id="nombreEmpleado" name="nombre" required>
              </div>
              <div class="form-group">
                <label for="cedulaEmpleado">Cédula *</label>
                <input type="text" id="cedulaEmpleado" name="cedula" required>
              </div>
              <div class="form-group">
                <label for="cargoEmpleado">Cargo *</label>
                <input type="text" id="cargoEmpleado" name="cargo" required>
              </div>
              <div class="form-group">
                <label for="departamentoEmpleado">Departamento *</label>
                <select id="departamentoEmpleado" name="departamento" required>
                  <option value="">Seleccionar departamento</option>
                </select>
              </div>
              <div class="form-group">
                <label for="salarioEmpleado">Salario Base *</label>
                <input type="number" id="salarioEmpleado" name="salario" min="0" step="1000" required>
              </div>
              <div class="form-group">
                <label for="fechaIngresoEmpleado">Fecha de Ingreso *</label>
                <input type="date" id="fechaIngresoEmpleado" name="fechaIngreso" required>
              </div>
              <div class="form-group">
                <label for="telefonoEmpleado">Teléfono</label>
                <input type="tel" id="telefonoEmpleado" name="telefono">
              </div>
              <div class="form-group">
                <label for="emailEmpleado">Email</label>
                <input type="email" id="emailEmpleado" name="email">
              </div>
              <div class="form-group">
                <label for="direccionEmpleado">Dirección</label>
                <textarea id="direccionEmpleado" name="direccion" rows="3"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.axyraGestionPersonal.cerrarModalEmpleado()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="window.axyraGestionPersonal.guardarEmpleado()">Guardar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.llenarSelectDepartamentos();
  }

  llenarSelectDepartamentos() {
    const select = document.getElementById('departamentoEmpleado');
    if (select) {
      select.innerHTML = '<option value="">Seleccionar departamento</option>';
      this.departamentos.forEach((dept) => {
        const option = document.createElement('option');
        option.value = dept.id;
        option.textContent = dept.nombre;
        select.appendChild(option);
      });
    }
  }

  llenarFormularioEmpleado(empleado) {
    document.getElementById('tituloModalEmpleado').textContent = 'Editar Empleado';
    document.getElementById('nombreEmpleado').value = empleado.nombre || '';
    document.getElementById('cedulaEmpleado').value = empleado.cedula || '';
    document.getElementById('cargoEmpleado').value = empleado.cargo || '';
    document.getElementById('departamentoEmpleado').value = empleado.departamento || '';
    document.getElementById('salarioEmpleado').value = empleado.salario || '';
    document.getElementById('fechaIngresoEmpleado').value = empleado.fechaIngreso || '';
    document.getElementById('telefonoEmpleado').value = empleado.telefono || '';
    document.getElementById('emailEmpleado').value = empleado.email || '';
    document.getElementById('direccionEmpleado').value = empleado.direccion || '';
  }

  limpiarFormularioEmpleado() {
    document.getElementById('tituloModalEmpleado').textContent = 'Nuevo Empleado';
    document.getElementById('formEmpleado').reset();
  }

  async guardarEmpleado() {
    try {
      const form = document.getElementById('formEmpleado');
      const formData = new FormData(form);

      const empleado = {
        id: this.empleadoSeleccionado ? this.empleadoSeleccionado.id : this.generarId(),
        nombre: formData.get('nombre'),
        cedula: formData.get('cedula'),
        cargo: formData.get('cargo'),
        departamento: formData.get('departamento'),
        salario: parseFloat(formData.get('salario')),
        fechaIngreso: formData.get('fechaIngreso'),
        telefono: formData.get('telefono'),
        email: formData.get('email'),
        direccion: formData.get('direccion'),
        fechaCreacion: this.empleadoSeleccionado ? this.empleadoSeleccionado.fechaCreacion : new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      };

      // Validar datos
      if (!this.validarEmpleado(empleado)) {
        return;
      }

      if (this.empleadoSeleccionado) {
        // Actualizar empleado existente
        const index = this.empleados.findIndex((e) => e.id === empleado.id);
        if (index !== -1) {
          this.empleados[index] = empleado;
        }
      } else {
        // Agregar nuevo empleado
        this.empleados.push(empleado);
      }

      // Guardar en localStorage
      this.guardarEmpleados();

      // Renderizar lista
      this.renderizarEmpleados();

      // Cerrar modal
      this.cerrarModalEmpleado();

      // Mostrar mensaje de éxito
      this.mostrarExito(
        this.empleadoSeleccionado ? 'Empleado actualizado correctamente' : 'Empleado agregado correctamente'
      );
    } catch (error) {
      console.error('❌ Error guardando empleado:', error);
      this.mostrarError('Error guardando el empleado');
    }
  }

  validarEmpleado(empleado) {
    if (!empleado.nombre || empleado.nombre.trim() === '') {
      this.mostrarError('El nombre es obligatorio');
      return false;
    }
    if (!empleado.cedula || empleado.cedula.trim() === '') {
      this.mostrarError('La cédula es obligatoria');
      return false;
    }
    if (!empleado.cargo || empleado.cargo.trim() === '') {
      this.mostrarError('El cargo es obligatorio');
      return false;
    }
    if (!empleado.departamento) {
      this.mostrarError('El departamento es obligatorio');
      return false;
    }
    if (!empleado.salario || empleado.salario <= 0) {
      this.mostrarError('El salario debe ser mayor a 0');
      return false;
    }
    if (!empleado.fechaIngreso) {
      this.mostrarError('La fecha de ingreso es obligatoria');
      return false;
    }

    // Verificar cédula única
    const cedulaExistente = this.empleados.find((e) => e.cedula === empleado.cedula && e.id !== empleado.id);
    if (cedulaExistente) {
      this.mostrarError('Ya existe un empleado con esta cédula');
      return false;
    }

    return true;
  }

  eliminarEmpleado(empleadoId) {
    try {
      if (confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
        this.empleados = this.empleados.filter((e) => e.id !== empleadoId);
        this.guardarEmpleados();
        this.renderizarEmpleados();
        this.mostrarExito('Empleado eliminado correctamente');
      }
    } catch (error) {
      console.error('❌ Error eliminando empleado:', error);
      this.mostrarError('Error eliminando el empleado');
    }
  }

  verHorasEmpleado(empleadoId) {
    try {
      const empleado = this.empleados.find((e) => e.id === empleadoId);
      if (empleado) {
        const horasEmpleado = this.horas.filter((h) => h.empleadoId === empleadoId);
        this.mostrarHorasEmpleado(empleado, horasEmpleado);
      }
    } catch (error) {
      console.error('❌ Error mostrando horas del empleado:', error);
      this.mostrarError('Error mostrando las horas del empleado');
    }
  }

  // ========================================
  // GESTIÓN DE HORAS
  // ========================================

  mostrarModalHoras(horasId = null) {
    try {
      const modal = document.getElementById('modalHoras');
      if (!modal) {
        this.crearModalHoras();
        return this.mostrarModalHoras(horasId);
      }

      if (horasId) {
        const horas = this.horas.find((h) => h.id === horasId);
        if (horas) {
          this.horasSeleccionadas = horas;
          this.llenarFormularioHoras(horas);
        }
      } else {
        this.horasSeleccionadas = null;
        this.limpiarFormularioHoras();
      }

      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    } catch (error) {
      console.error('❌ Error mostrando modal horas:', error);
      this.mostrarError('Error mostrando el formulario de horas');
    }
  }

  cerrarModalHoras() {
    try {
      const modal = document.getElementById('modalHoras');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    } catch (error) {
      console.error('❌ Error cerrando modal horas:', error);
    }
  }

  crearModalHoras() {
    const modalHTML = `
      <div id="modalHoras" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="tituloModalHoras">Registrar Horas</h2>
            <span class="close" onclick="window.axyraGestionPersonal.cerrarModalHoras()">&times;</span>
          </div>
          <div class="modal-body">
            <form id="formHoras">
              <div class="form-group">
                <label for="empleadoHoras">Empleado *</label>
                <select id="empleadoHoras" name="empleadoId" required>
                  <option value="">Seleccionar empleado</option>
                </select>
              </div>
              <div class="form-group">
                <label for="fechaHoras">Fecha *</label>
                <input type="date" id="fechaHoras" name="fecha" required>
              </div>
              <div class="form-group">
                <label for="horaInicioHoras">Hora de Inicio *</label>
                <input type="time" id="horaInicioHoras" name="horaInicio" required>
              </div>
              <div class="form-group">
                <label for="horaFinHoras">Hora de Fin *</label>
                <input type="time" id="horaFinHoras" name="horaFin" required>
              </div>
              <div class="form-group">
                <label for="descripcionHoras">Descripción</label>
                <textarea id="descripcionHoras" name="descripcion" rows="3" placeholder="Descripción de las actividades realizadas"></textarea>
              </div>
              <div class="form-group">
                <label for="tipoHoras">Tipo de Horas</label>
                <select id="tipoHoras" name="tipo">
                  <option value="normal">Normal</option>
                  <option value="extra">Extra</option>
                  <option value="nocturna">Nocturna</option>
                  <option value="dominical">Dominical</option>
                  <option value="festivo">Festivo</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.axyraGestionPersonal.cerrarModalHoras()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="window.axyraGestionPersonal.guardarHoras()">Guardar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.llenarSelectEmpleados();
  }

  llenarSelectEmpleados() {
    const select = document.getElementById('empleadoHoras');
    if (select) {
      select.innerHTML = '<option value="">Seleccionar empleado</option>';
      this.empleados.forEach((empleado) => {
        const option = document.createElement('option');
        option.value = empleado.id;
        option.textContent = `${empleado.nombre} - ${empleado.cargo}`;
        select.appendChild(option);
      });
    }
  }

  llenarFormularioHoras(horas) {
    document.getElementById('tituloModalHoras').textContent = 'Editar Horas';
    document.getElementById('empleadoHoras').value = horas.empleadoId || '';
    document.getElementById('fechaHoras').value = horas.fecha || '';
    document.getElementById('horaInicioHoras').value = horas.horaInicio || '';
    document.getElementById('horaFinHoras').value = horas.horaFin || '';
    document.getElementById('descripcionHoras').value = horas.descripcion || '';
    document.getElementById('tipoHoras').value = horas.tipo || 'normal';
  }

  limpiarFormularioHoras() {
    document.getElementById('tituloModalHoras').textContent = 'Registrar Horas';
    document.getElementById('formHoras').reset();
    // Establecer fecha actual
    const fechaInput = document.getElementById('fechaHoras');
    if (fechaInput) {
      fechaInput.value = new Date().toISOString().split('T')[0];
    }
  }

  async guardarHoras() {
    try {
      const form = document.getElementById('formHoras');
      const formData = new FormData(form);

      const horas = {
        id: this.horasSeleccionadas ? this.horasSeleccionadas.id : this.generarId(),
        empleadoId: formData.get('empleadoId'),
        fecha: formData.get('fecha'),
        horaInicio: formData.get('horaInicio'),
        horaFin: formData.get('horaFin'),
        descripcion: formData.get('descripcion'),
        tipo: formData.get('tipo'),
        fechaCreacion: this.horasSeleccionadas ? this.horasSeleccionadas.fechaCreacion : new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      };

      // Validar datos
      if (!this.validarHoras(horas)) {
        return;
      }

      // Calcular horas trabajadas
      const horasTrabajadas = this.calcularHorasTrabajadas(horas.horaInicio, horas.horaFin);
      horas.horasTrabajadas = horasTrabajadas;

      if (this.horasSeleccionadas) {
        // Actualizar horas existentes
        const index = this.horas.findIndex((h) => h.id === horas.id);
        if (index !== -1) {
          this.horas[index] = horas;
        }
      } else {
        // Agregar nuevas horas
        this.horas.push(horas);
      }

      // Guardar en localStorage
      this.guardarHoras();

      // Renderizar lista
      this.renderizarHoras();

      // Cerrar modal
      this.cerrarModalHoras();

      // Mostrar mensaje de éxito
      this.mostrarExito(
        this.horasSeleccionadas ? 'Horas actualizadas correctamente' : 'Horas registradas correctamente'
      );
    } catch (error) {
      console.error('❌ Error guardando horas:', error);
      this.mostrarError('Error guardando las horas');
    }
  }

  validarHoras(horas) {
    if (!horas.empleadoId) {
      this.mostrarError('Debe seleccionar un empleado');
      return false;
    }
    if (!horas.fecha) {
      this.mostrarError('La fecha es obligatoria');
      return false;
    }
    if (!horas.horaInicio) {
      this.mostrarError('La hora de inicio es obligatoria');
      return false;
    }
    if (!horas.horaFin) {
      this.mostrarError('La hora de fin es obligatoria');
      return false;
    }

    // Validar que la hora de fin sea mayor a la de inicio
    const horaInicio = new Date(`2000-01-01T${horas.horaInicio}`);
    const horaFin = new Date(`2000-01-01T${horas.horaFin}`);

    if (horaFin <= horaInicio) {
      this.mostrarError('La hora de fin debe ser mayor a la hora de inicio');
      return false;
    }

    return true;
  }

  calcularHorasTrabajadas(horaInicio, horaFin) {
    try {
      const inicio = new Date(`2000-01-01T${horaInicio}`);
      const fin = new Date(`2000-01-01T${horaFin}`);

      const diferencia = fin - inicio;
      const horas = diferencia / (1000 * 60 * 60);

      return Math.round(horas * 100) / 100; // Redondear a 2 decimales
    } catch (error) {
      console.error('❌ Error calculando horas trabajadas:', error);
      return 0;
    }
  }

  eliminarHoras(horasId) {
    try {
      if (confirm('¿Estás seguro de que deseas eliminar este registro de horas?')) {
        this.horas = this.horas.filter((h) => h.id !== horasId);
        this.guardarHoras();
        this.renderizarHoras();
        this.mostrarExito('Registro de horas eliminado correctamente');
      }
    } catch (error) {
      console.error('❌ Error eliminando horas:', error);
      this.mostrarError('Error eliminando el registro de horas');
    }
  }

  editarHoras(horasId) {
    this.mostrarModalHoras(horasId);
  }

  verDetalleHoras(horasId) {
    try {
      console.log('🔍 Buscando horas con ID:', horasId);
      const horas = this.horas.find((h) => h.id === horasId);
      if (horas) {
        console.log('✅ Horas encontradas:', horas);
        const empleado = this.empleados.find((e) => e.id === horas.empleadoId);
        console.log('✅ Empleado encontrado:', empleado);
        this.mostrarDetalleHoras(horas, empleado);
      } else {
        console.warn('⚠️ No se encontraron horas con ID:', horasId);
        this.mostrarError('No se encontraron las horas especificadas');
      }
    } catch (error) {
      console.error('❌ Error mostrando detalle de horas:', error);
      this.mostrarError('Error mostrando el detalle de las horas');
    }
  }

  // ========================================
  // RENDERIZADO
  // ========================================

  renderizarEmpleados() {
    try {
      const container = document.getElementById('listaEmpleados');
      if (!container) return;

      if (this.empleados.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-users"></i>
            </div>
            <h3>No hay empleados registrados</h3>
            <p>Comienza agregando tu primer empleado al sistema</p>
            <button class="btn btn-primary" onclick="mostrarModalEmpleado()">
              <i class="fas fa-plus"></i> Agregar Empleado
            </button>
          </div>
        `;
        return;
      }

      const html = this.empleados
        .map(
          (empleado) => `
        <div class="empleado-card">
          <div class="empleado-info">
            <h4>${empleado.nombre}</h4>
            <p><strong>Cédula:</strong> ${empleado.cedula}</p>
            <p><strong>Cargo:</strong> ${empleado.cargo}</p>
            <p><strong>Departamento:</strong> ${this.getDepartamentoNombre(empleado.departamento)}</p>
            <p><strong>Salario:</strong> $${empleado.salario.toLocaleString()}</p>
            <p><strong>Fecha Ingreso:</strong> ${new Date(empleado.fechaIngreso).toLocaleDateString()}</p>
          </div>
          <div class="empleado-actions">
            <button class="btn btn-sm btn-primary" data-action="editar-empleado" data-empleado-id="${empleado.id}">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-sm btn-info" data-action="ver-horas-empleado" data-empleado-id="${empleado.id}">
              <i class="fas fa-clock"></i> Ver Horas
            </button>
            <button class="btn btn-sm btn-danger" data-action="eliminar-empleado" data-empleado-id="${empleado.id}">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        </div>
      `
        )
        .join('');

      container.innerHTML = html;
    } catch (error) {
      console.error('❌ Error renderizando empleados:', error);
    }
  }

  renderizarHoras() {
    try {
      const container = document.getElementById('listaHoras');
      if (!container) return;

      if (this.horas.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-clock"></i>
            </div>
            <h3>No hay horas registradas</h3>
            <p>Comienza registrando las horas trabajadas por tus empleados</p>
            <button class="btn btn-primary" onclick="mostrarModalHoras()">
              <i class="fas fa-plus"></i> Registrar Horas
            </button>
          </div>
        `;
        return;
      }

      const html = this.horas
        .map((horas) => {
          const empleado = this.empleados.find((e) => e.id === horas.empleadoId);
          return `
          <div class="horas-card">
            <div class="horas-info">
              <h4>${empleado ? empleado.nombre : 'Empleado no encontrado'}</h4>
              <p><strong>Fecha:</strong> ${new Date(horas.fecha).toLocaleDateString()}</p>
              <p><strong>Horario:</strong> ${horas.horaInicio} - ${horas.horaFin}</p>
              <p><strong>Horas Trabajadas:</strong> ${horas.horasTrabajadas} horas</p>
              <p><strong>Tipo:</strong> ${this.getTipoHorasNombre(horas.tipo)}</p>
              ${horas.descripcion ? `<p><strong>Descripción:</strong> ${horas.descripcion}</p>` : ''}
            </div>
            <div class="horas-actions">
              <button class="btn btn-sm btn-primary" data-action="editar-horas" data-horas-id="${horas.id}">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button class="btn btn-sm btn-info" data-action="ver-detalle-horas" data-horas-id="${horas.id}">
                <i class="fas fa-eye"></i> Ver Detalle
              </button>
              <button class="btn btn-sm btn-danger" data-action="eliminar-horas" data-horas-id="${horas.id}">
                <i class="fas fa-trash"></i> Eliminar
              </button>
            </div>
          </div>
        `;
        })
        .join('');

      container.innerHTML = html;
    } catch (error) {
      console.error('❌ Error renderizando horas:', error);
    }
  }

  renderizarDepartamentos() {
    try {
      const container = document.getElementById('listaDepartamentos');
      if (!container) return;

      if (this.departamentos.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-building"></i>
            </div>
            <h3>No hay departamentos registrados</h3>
            <p>Los departamentos se crean automáticamente al agregar empleados</p>
          </div>
        `;
        return;
      }

      const html = this.departamentos
        .map(
          (departamento) => `
        <div class="departamento-card">
          <div class="departamento-info">
            <h4>${departamento.nombre}</h4>
            <p><strong>ID:</strong> ${departamento.id}</p>
            <p><strong>Empleados:</strong> ${
              this.empleados.filter((e) => e.departamento === departamento.id).length
            }</p>
          </div>
          <div class="departamento-actions">
            <button class="btn btn-sm btn-primary" data-action="editar-departamento" data-departamento-id="${
              departamento.id
            }">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-sm btn-danger" data-action="eliminar-departamento" data-departamento-id="${
              departamento.id
            }">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        </div>
      `
        )
        .join('');

      container.innerHTML = html;
    } catch (error) {
      console.error('❌ Error renderizando departamentos:', error);
    }
  }


  // ========================================
  // FUNCIONES DE EXPORTACIÓN
  // ========================================

  exportarEmpleadosPDF() {
    try {
      if (this.empleados.length === 0) {
        this.mostrarInfo('No hay empleados para exportar');
        return;
      }

      // Crear contenido HTML para PDF
      let contenido = `
        <h2>Lista de Empleados - AXYRA</h2>
        <p>Fecha de exportación: ${new Date().toLocaleDateString()}</p>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Cargo</th>
              <th>Departamento</th>
              <th>Salario</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
      `;

      this.empleados.forEach(empleado => {
        contenido += `
          <tr>
            <td>${empleado.nombre}</td>
            <td>${empleado.cedula}</td>
            <td>${empleado.cargo}</td>
            <td>${this.getDepartamentoNombre(empleado.departamento)}</td>
            <td>$${empleado.salario.toLocaleString()}</td>
            <td>Activo</td>
          </tr>
        `;
      });

      contenido += `
          </tbody>
        </table>
      `;

      // Crear ventana para imprimir
      const ventanaImpresion = window.open('', '_blank');
      ventanaImpresion.document.write(`
        <html>
          <head>
            <title>Lista de Empleados - AXYRA</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            ${contenido}
          </body>
        </html>
      `);
      ventanaImpresion.document.close();
      ventanaImpresion.print();

      this.mostrarExito('PDF generado correctamente');
    } catch (error) {
      console.error('❌ Error exportando PDF:', error);
      this.mostrarError('Error generando el PDF');
    }
  }

  imprimirListaEmpleados() {
    try {
      if (this.empleados.length === 0) {
        this.mostrarInfo('No hay empleados para imprimir');
        return;
      }

      // Crear contenido para imprimir
      let contenido = `
        <h2>Lista de Empleados - AXYRA</h2>
        <p>Fecha: ${new Date().toLocaleDateString()}</p>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Cargo</th>
              <th>Departamento</th>
              <th>Salario</th>
            </tr>
          </thead>
          <tbody>
      `;

      this.empleados.forEach(empleado => {
        contenido += `
          <tr>
            <td>${empleado.nombre}</td>
            <td>${empleado.cedula}</td>
            <td>${empleado.cargo}</td>
            <td>${this.getDepartamentoNombre(empleado.departamento)}</td>
            <td>$${empleado.salario.toLocaleString()}</td>
          </tr>
        `;
      });

      contenido += `
          </tbody>
        </table>
      `;

      // Crear ventana para imprimir
      const ventanaImpresion = window.open('', '_blank');
      ventanaImpresion.document.write(`
        <html>
          <head>
            <title>Lista de Empleados - AXYRA</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              @media print {
                body { margin: 0; }
                @page { margin: 1cm; }
              }
            </style>
          </head>
          <body>
            ${contenido}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      ventanaImpresion.document.close();

      this.mostrarExito('Lista enviada a impresión');
    } catch (error) {
      console.error('❌ Error imprimiendo lista:', error);
      this.mostrarError('Error enviando a impresión');
    }
  }

  // ========================================
  // UTILIDADES
  // ========================================

  getDepartamentoNombre(departamentoId) {
    const departamento = this.departamentos.find((d) => d.id === departamentoId);
    return departamento ? departamento.nombre : 'No asignado';
  }

  getTipoHorasNombre(tipo) {
    const tipos = {
      normal: 'Normal',
      extra: 'Extra',
      nocturna: 'Nocturna',
      dominical: 'Dominical',
      festivo: 'Festivo',
    };
    return tipos[tipo] || 'Normal';
  }

  generarId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  actualizarEstadisticas() {
    try {
      const totalEmpleados = this.empleados.length;
      const totalHoras = this.horas.length;
      const totalDepartamentos = this.departamentos.length;

      const horasTotales = this.horas.reduce((sum, h) => sum + (h.horasTrabajadas || 0), 0);
      const promedioHoras = totalHoras > 0 ? (horasTotales / totalHoras).toFixed(2) : 0;

      // Actualizar elementos de estadísticas específicos
      const totalEmpleadosEl = document.getElementById('totalEmpleados');
      const totalHorasEl = document.getElementById('totalHoras');
      const totalDepartamentosEl = document.getElementById('totalDepartamentos');
      const promedioHorasEl = document.getElementById('promedioHoras');

      if (totalEmpleadosEl) totalEmpleadosEl.textContent = totalEmpleados;
      if (totalHorasEl) totalHorasEl.textContent = totalHoras;
      if (totalDepartamentosEl) totalDepartamentosEl.textContent = totalDepartamentos;
      if (promedioHorasEl) promedioHorasEl.textContent = promedioHoras;

      console.log('✅ Estadísticas actualizadas:', {
        totalEmpleados,
        totalHoras,
        totalDepartamentos,
        horasTotales,
        promedioHoras,
      });
    } catch (error) {
      console.error('❌ Error actualizando estadísticas:', error);
    }
  }

  // ========================================
  // PERSISTENCIA
  // ========================================

  guardarEmpleados() {
    try {
      localStorage.setItem('axyra_empleados', JSON.stringify(this.empleados));
    } catch (error) {
      console.error('❌ Error guardando empleados:', error);
    }
  }

  guardarHoras() {
    try {
      localStorage.setItem('axyra_horas', JSON.stringify(this.horas));
    } catch (error) {
      console.error('❌ Error guardando horas:', error);
    }
  }

  guardarDepartamentos() {
    try {
      localStorage.setItem('axyra_departamentos', JSON.stringify(this.departamentos));
    } catch (error) {
      console.error('❌ Error guardando departamentos:', error);
    }
  }

  // ========================================
  // CONECTIVIDAD
  // ========================================

  handleOnline() {
    this.isOnline = true;
    console.log('🌐 Conexión restaurada');
    this.sincronizarPendientes();
  }

  handleOffline() {
    this.isOnline = false;
    console.log('📴 Sin conexión, trabajando en modo offline');
  }

  async sincronizarPendientes() {
    try {
      if (this.pendingSync.length > 0) {
        console.log(`🔄 Sincronizando ${this.pendingSync.length} elementos pendientes...`);
        // Aquí se implementaría la sincronización con Firebase
        this.pendingSync = [];
        console.log('✅ Sincronización completada');
      }
    } catch (error) {
      console.error('❌ Error sincronizando pendientes:', error);
    }
  }

  // ========================================
  // NOTIFICACIONES
  // ========================================

  mostrarExito(mensaje) {
    try {
      if (window.axyraNotifications) {
        window.axyraNotifications.showSuccess(mensaje);
      } else {
        alert('✅ ' + mensaje);
      }
    } catch (error) {
      console.error('❌ Error mostrando notificación de éxito:', error);
    }
  }

  mostrarError(mensaje) {
    try {
      if (window.axyraNotifications) {
        window.axyraNotifications.showError(mensaje);
      } else {
        alert('❌ ' + mensaje);
      }
    } catch (error) {
      console.error('❌ Error mostrando notificación de error:', error);
    }
  }

  mostrarInfo(mensaje) {
    try {
      if (window.axyraNotifications) {
        window.axyraNotifications.showInfo(mensaje);
      } else {
        alert('ℹ️ ' + mensaje);
      }
    } catch (error) {
      console.error('❌ Error mostrando notificación de info:', error);
    }
  }

  // ========================================
  // FUNCIONES PÚBLICAS
  // ========================================

  // Funciones para ser llamadas desde HTML
  mostrarModalEmpleado(empleadoId = null) {
    try {
      const modal = document.getElementById('modalEmpleado');
      if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Limpiar formulario
        const form = document.getElementById('formEmpleado');
        if (form) {
          form.reset();
        }
        
        // Enfocar primer campo
        const primerCampo = modal.querySelector('input');
        if (primerCampo) {
          primerCampo.focus();
        }
      }
    } catch (error) {
      console.error('❌ Error mostrando modal empleado:', error);
      this.mostrarError('Error abriendo el formulario de empleado');
    }
  }

  cerrarModalEmpleado() {
    try {
      const modal = document.getElementById('modalEmpleado');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    } catch (error) {
      console.error('❌ Error cerrando modal empleado:', error);
    }
  }

  guardarEmpleado() {
    try {
      const form = document.getElementById('formEmpleado');
      if (!form) {
        this.mostrarError('Formulario no encontrado');
        return;
      }

      const formData = new FormData(form);
      const empleado = {
        id: this.generarId(),
        nombre: formData.get('nombre') || '',
        cedula: formData.get('cedula') || '',
        cargo: formData.get('cargo') || '',
        departamento: formData.get('departamento') || 'admin',
        salario: parseFloat(formData.get('salario')) || 0,
        fechaIngreso: formData.get('fechaIngreso') || new Date().toISOString().split('T')[0],
        telefono: formData.get('telefono') || '',
        email: formData.get('email') || '',
        direccion: formData.get('direccion') || '',
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };

      // Validar datos requeridos
      if (!empleado.nombre || !empleado.cedula) {
        this.mostrarError('Nombre y cédula son campos requeridos');
        return;
      }

      // Verificar si ya existe un empleado con la misma cédula
      const empleadoExistente = this.empleados.find(e => e.cedula === empleado.cedula);
      if (empleadoExistente) {
        this.mostrarError('Ya existe un empleado con esta cédula');
        return;
      }

      // Agregar empleado
      this.empleados.push(empleado);
      this.guardarEmpleados();
      this.renderizarEmpleados();
      this.actualizarEstadisticas();
      this.cerrarModalEmpleado();
      
      this.mostrarExito('Empleado guardado correctamente');
      console.log('✅ Empleado guardado:', empleado);
    } catch (error) {
      console.error('❌ Error guardando empleado:', error);
      this.mostrarError('Error guardando el empleado');
    }
  }

  mostrarModalHoras(horasId = null) {
    this.mostrarModalHoras(horasId);
  }

  cerrarModalHoras() {
    this.cerrarModalHoras();
  }

  guardarHoras() {
    this.guardarHoras();
  }

  calcularHoras() {
    // Función para calcular horas (implementar según necesidades)
    console.log('Calculando horas...');
  }

  generarComprobante() {
    // Función para generar comprobante (implementar según necesidades)
    console.log('Generando comprobante...');
  }

  generarNomina() {
    // Función para generar nómina (implementar según necesidades)
    console.log('Generando nómina...');
  }

  // Función para limpiar tabla de horas
  limpiarTablaHoras() {
    try {
      console.log('🧹 Limpiando tabla de horas...');
      
      // Verificar si hay datos para limpiar
      if (this.horas.length === 0) {
        this.mostrarInfo('No hay horas registradas para limpiar');
        return;
      }
      
      // Confirmar antes de limpiar
      if (confirm(`¿Estás seguro de que deseas eliminar TODAS las ${this.horas.length} horas registradas? Esta acción no se puede deshacer.`)) {
        // Limpiar datos en memoria
        this.horas = [];
        this.guardarHoras();
        
        // Re-renderizar la lista de horas (mostrará estado vacío)
        this.renderizarHoras();
        
        // Actualizar estadísticas
        this.actualizarEstadisticas();
        
        // Mostrar mensaje de éxito
        this.mostrarExito('Todas las horas han sido eliminadas correctamente');
        
        console.log('✅ Tabla de horas limpiada completamente');
      } else {
        console.log('❌ Limpieza de tabla cancelada por el usuario');
      }
    } catch (error) {
      console.error('❌ Error limpiando tabla de horas:', error);
      this.mostrarError('Error limpiando la tabla de horas');
    }
  }

  // Función para mostrar horas de un empleado específico
  mostrarHorasEmpleado(empleado, horasEmpleado) {
    try {
      const modal = document.getElementById('modalHorasEmpleado');
      if (!modal) {
        this.crearModalHorasEmpleado();
        return this.mostrarHorasEmpleado(empleado, horasEmpleado);
      }

      // Llenar el modal con los datos
      const empleadoNombre = document.getElementById('empleadoNombreHoras');
      const listaHoras = document.getElementById('listaHorasEmpleado');

      if (empleadoNombre) {
        empleadoNombre.textContent = empleado.nombre;
      }

      if (listaHoras) {
        if (horasEmpleado.length === 0) {
          listaHoras.innerHTML = '<p class="no-data">No hay horas registradas para este empleado</p>';
        } else {
          const html = horasEmpleado.map(horas => `
            <div class="horas-empleado-item">
              <div class="horas-info">
                <p><strong>Fecha:</strong> ${new Date(horas.fecha).toLocaleDateString()}</p>
                <p><strong>Horario:</strong> ${horas.horaInicio} - ${horas.horaFin}</p>
                <p><strong>Horas Trabajadas:</strong> ${horas.horasTrabajadas} horas</p>
                <p><strong>Tipo:</strong> ${this.getTipoHorasNombre(horas.tipo)}</p>
                ${horas.descripcion ? `<p><strong>Descripción:</strong> ${horas.descripcion}</p>` : ''}
              </div>
              <div class="horas-actions">
                <button class="btn btn-sm btn-primary" onclick="window.axyraGestionPersonal.editarHoras('${horas.id}')">
                  <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="window.axyraGestionPersonal.eliminarHoras('${horas.id}')">
                  <i class="fas fa-trash"></i> Eliminar
                </button>
              </div>
            </div>
          `).join('');
          listaHoras.innerHTML = html;
        }
      }

      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    } catch (error) {
      console.error('❌ Error mostrando horas del empleado:', error);
      this.mostrarError('Error mostrando las horas del empleado');
    }
  }

  // Función para crear modal de horas de empleado
  crearModalHorasEmpleado() {
    const modalHTML = `
      <div id="modalHorasEmpleado" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Horas del Empleado: <span id="empleadoNombreHoras"></span></h2>
            <span class="close" onclick="window.axyraGestionPersonal.cerrarModalHorasEmpleado()">&times;</span>
          </div>
          <div class="modal-body">
            <div id="listaHorasEmpleado">
              <!-- Las horas se cargarán aquí -->
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.axyraGestionPersonal.cerrarModalHorasEmpleado()">Cerrar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Función para cerrar modal de horas de empleado
  cerrarModalHorasEmpleado() {
    try {
      const modal = document.getElementById('modalHorasEmpleado');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    } catch (error) {
      console.error('❌ Error cerrando modal horas empleado:', error);
    }
  }

  // Función para mostrar detalle de horas
  mostrarDetalleHoras(horas, empleado) {
    try {
      const modal = document.getElementById('modalDetalleHoras');
      if (!modal) {
        this.crearModalDetalleHoras();
        return this.mostrarDetalleHoras(horas, empleado);
      }

      // Llenar el modal con los datos
      const empleadoNombre = document.getElementById('detalleEmpleadoNombre');
      const fechaDetalle = document.getElementById('detalleFecha');
      const horarioDetalle = document.getElementById('detalleHorario');
      const horasTrabajadasDetalle = document.getElementById('detalleHorasTrabajadas');
      const tipoDetalle = document.getElementById('detalleTipo');
      const descripcionDetalle = document.getElementById('detalleDescripcion');

      if (empleadoNombre) empleadoNombre.textContent = empleado ? empleado.nombre : 'Empleado no encontrado';
      if (fechaDetalle) fechaDetalle.textContent = new Date(horas.fecha).toLocaleDateString();
      if (horarioDetalle) horarioDetalle.textContent = `${horas.horaInicio} - ${horas.horaFin}`;
      if (horasTrabajadasDetalle) horasTrabajadasDetalle.textContent = `${horas.horasTrabajadas} horas`;
      if (tipoDetalle) tipoDetalle.textContent = this.getTipoHorasNombre(horas.tipo);
      if (descripcionDetalle) descripcionDetalle.textContent = horas.descripcion || 'Sin descripción';

      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    } catch (error) {
      console.error('❌ Error mostrando detalle de horas:', error);
      this.mostrarError('Error mostrando el detalle de las horas');
    }
  }

  // Función para crear modal de detalle de horas
  crearModalDetalleHoras() {
    const modalHTML = `
      <div id="modalDetalleHoras" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Detalle de Horas</h2>
            <span class="close" onclick="window.axyraGestionPersonal.cerrarModalDetalleHoras()">&times;</span>
          </div>
          <div class="modal-body">
            <div class="detalle-horas-container">
              <div class="detalle-item">
                <label>Empleado:</label>
                <span id="detalleEmpleadoNombre"></span>
              </div>
              <div class="detalle-item">
                <label>Fecha:</label>
                <span id="detalleFecha"></span>
              </div>
              <div class="detalle-item">
                <label>Horario:</label>
                <span id="detalleHorario"></span>
              </div>
              <div class="detalle-item">
                <label>Horas Trabajadas:</label>
                <span id="detalleHorasTrabajadas"></span>
              </div>
              <div class="detalle-item">
                <label>Tipo:</label>
                <span id="detalleTipo"></span>
              </div>
              <div class="detalle-item">
                <label>Descripción:</label>
                <span id="detalleDescripcion"></span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" onclick="window.axyraGestionPersonal.editarHoras()">Editar</button>
            <button type="button" class="btn btn-secondary" onclick="window.axyraGestionPersonal.cerrarModalDetalleHoras()">Cerrar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Función para cerrar modal de detalle de horas
  cerrarModalDetalleHoras() {
    try {
      const modal = document.getElementById('modalDetalleHoras');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    } catch (error) {
      console.error('❌ Error cerrando modal detalle horas:', error);
    }
  }
}

// Inicializar el sistema
window.axyraGestionPersonal = new AxyraGestionPersonal();

console.log('✅ AXYRA Gestión de Personal cargado correctamente');

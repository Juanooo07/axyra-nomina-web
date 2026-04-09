/**
 * AXYRA - SISTEMA DE GESTIÓN DE EMPLEADOS FIJOS
 * Módulo completo y corregido para empleados con salario fijo
 * Versión: 2.0 - MEJORADA
 */

class AxyraEmpleadosFijos {
  constructor() {
    this.empleados = [];
    this.historialSalarios = [];
    this.deduccionesDefault = {
      afiliadoAFP: 0.10,           // 10% AFP
      afiliadoSalud: 0.04,         // 4% Salud (puede variar)
      impuestoRenta: 0.08,         // 8% (aprox, depende del país)
      sindicato: 0.02,             // 2% (si aplica)
    };
    this.init();
  }

  async init() {
    try {
      console.log('🚀 Inicializando Sistema de Empleados Fijos AXYRA...');
      this.cargarEmpleados();
      console.log('✅ Sistema de Empleados Fijos inicializado');
    } catch (error) {
      if (window.axyraLogger) {
        axyraLogger.error('EmpleadosFijos', 'Error inicializando', error);
      } else {
        console.error('❌ Error inicializando empleados fijos:', error);
      }
    }
  }

  /**
   * CREAR o ACTUALIZAR empleado fijo
   */
  agregarEmpleadoFijo(datosEmpleado) {
    try {
      // Validaciones obligatorias
      if (!datosEmpleado.nombre || datosEmpleado.nombre.trim() === '') {
        throw new Error('El nombre del empleado es obligatorio');
      }
      if (!datosEmpleado.cedula || datosEmpleado.cedula.trim() === '') {
        throw new Error('La cédula es obligatoria');
      }
      if (!datosEmpleado.salarioFijo || datosEmpleado.salarioFijo <= 0) {
        throw new Error('El salario fijo debe ser mayor a 0');
      }

      // Estructura del empleado fijo
      const empleado = {
        id: datosEmpleado.id || Date.now().toString(),
        nombre: datosEmpleado.nombre.trim(),
        cedula: datosEmpleado.cedula.trim(),
        cargo: datosEmpleado.cargo || 'No especificado',
        departamento: datosEmpleado.departamento || 'General',
        
        // DATOS SALARIALES
        tipoContrato: 'FIJO', // Importante: marca como fijo
        salarioFijo: parseFloat(datosEmpleado.salarioFijo),
        salarioBase: parseFloat(datosEmpleado.salarioFijo), // Referencia
        
        // BONIFICACIONES Y ADICIONALES
        bonificacion: parseFloat(datosEmpleado.bonificacion) || 0,
        auxTransporte: parseFloat(datosEmpleado.auxTransporte) || 0,
        auxAlimentacion: parseFloat(datosEmpleado.auxAlimentacion) || 0,
        otrasBonificaciones: parseFloat(datosEmpleado.otrasBonificaciones) || 0,
        
        // DEDUCCIONES VARIABLES
        descuentosDiversos: parseFloat(datosEmpleado.descuentosDiversos) || 0,
        creditosLaborales: parseFloat(datosEmpleado.creditosLaborales) || 0,
        
        // DATOS ADMINISTRATIVOS
        fechaIngreso: datosEmpleado.fechaIngreso || new Date().toISOString().split('T')[0],
        estado: datosEmpleado.estado || 'ACTIVO',
        email: datosEmpleado.email || '',
        telefono: datosEmpleado.telefono || '',
        
        // FECHA DE CREACIÓN
        fechaCreacion: datosEmpleado.fechaCreacion || new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      };

      // Verificar duplicados por cédula
      const existe = this.empleados.find(e => e.cedula === empleado.cedula && e.id !== empleado.id);
      if (existe) {
        throw new Error(`Ya existe un empleado registrado con la cédula ${empleado.cedula}`);
      }

      // Agregar o actualizar
      const indexExistente = this.empleados.findIndex(e => e.id === empleado.id);
      if (indexExistente >= 0) {
        this.empleados[indexExistente] = empleado;
      } else {
        this.empleados.push(empleado);
      }

      // Guardar
      this.guardarEmpleados();

      if (window.axyraLogger) {
        axyraLogger.log('EmpleadosFijos', `Empleado fijo guardado: ${empleado.nombre}`);
      }

      return empleado;
    } catch (error) {
      if (window.axyraLogger) {
        axyraLogger.error('EmpleadosFijos', 'Error agregando empleado fijo', error);
      } else {
        console.error('❌ Error:', error.message);
      }
      throw error;
    }
  }

  /**
   * CALCULAR SALARIO TOTAL MENSUAL CON TODAS DEDUCCIONES
   */
  calcularSalarioMensual(empleadoId) {
    try {
      const empleado = this.empleados.find(e => e.id === empleadoId);
      if (!empleado) {
        throw new Error(`Empleado ${empleadoId} no encontrado`);
      }

      // BASE = Salario fijo + bonificaciones
      const salarioBruto = 
        empleado.salarioFijo + 
        empleado.bonificacion + 
        empleado.auxTransporte + 
        empleado.auxAlimentacion + 
        empleado.otrasBonificaciones;

      // DEDUCCIONES OBLIGATORIAS
      const afp = salarioBruto * this.deduccionesDefault.afiliadoAFP;
      const salud = salarioBruto * this.deduccionesDefault.afiliadoSalud;
      const impuestoRenta = salarioBruto * this.deduccionesDefault.impuestoRenta;
      const sindicato = salarioBruto * this.deduccionesDefault.sindicato;

      // DEDUCCIONES VARIABLES
      const otrosDescuentos = 
        empleado.descuentosDiversos + 
        empleado.creditosLaborales;

      // TOTAL DEDUCCIONES
      const totalDeducciones = 
        afp + 
        salud + 
        impuestoRenta + 
        sindicato + 
        otrosDescuentos;

      // SALARIO NETO
      const salarioNeto = salarioBruto - totalDeducciones;

      // RESULTADO DETALLADO
      const resultado = {
        empleadoId: empleadoId,
        empleadoNombre: empleado.nombre,
        empleadoCargo: empleado.cargo,
        
        // INGRESOS
        salarioBase: empleado.salarioFijo,
        bonificacion: empleado.bonificacion,
        auxTransporte: empleado.auxTransporte,
        auxAlimentacion: empleado.auxAlimentacion,
        otrasBonificaciones: empleado.otrasBonificaciones,
        salarioBruto: Math.round(salarioBruto * 100) / 100,
        
        // DEDUCCIONES OBLIGATORIAS (% del bruto)
        afp: Math.round(afp * 100) / 100,
        salud: Math.round(salud * 100) / 100,
        impuestoRenta: Math.round(impuestoRenta * 100) / 100,
        sindicato: Math.round(sindicato * 100) / 100,
        
        // DEDUCCIONES VARIABLES
        descuentosDiversos: empleado.descuentosDiversos,
        creditosLaborales: empleado.creditosLaborales,
        
        // TOTALES
        totalDeducciones: Math.round(totalDeducciones * 100) / 100,
        salarioNeto: Math.round(salarioNeto * 100) / 100,
        
        // INFORMACIÓN ADICIONAL
        porcentajeDeducciones: ((totalDeducciones / salarioBruto) * 100).toFixed(2) + '%',
        fechaCalculo: new Date().toISOString(),
      };

      return resultado;
    } catch (error) {
      if (window.axyraLogger) {
        axyraLogger.error('EmpleadosFijos', 'Error calculando salario', error);
      } else {
        console.error('❌ Error:', error.message);
      }
      throw error;
    }
  }

  /**
   * GENERAR NÓMINA MENSUAL PARA TODOS LOS EMPLEADOS FIJOS
   */
  generarNominaMensual(mes = null, año = null) {
    try {
      if (!mes) mes = new Date().getMonth() + 1;
      if (!año) año = new Date().getFullYear();

      const nominaMes = {
        mes: mes,
        año: año,
        fechaGeneracion: new Date().toISOString(),
        empleados: [],
        totales: {
          totalSalariosBrutos: 0,
          totalAFP: 0,
          totalSalud: 0,
          totalImpuestos: 0,
          totalDeducciones: 0,
          totalSalariosNetos: 0,
          cantidadEmpleados: 0,
        }
      };

      // Procesar cada empleado
      this.empleados
        .filter(e => e.estado === 'ACTIVO' && e.tipoContrato === 'FIJO')
        .forEach(empleado => {
          const calculo = this.calcularSalarioMensual(empleado.id);
          
          nominaMes.empleados.push(calculo);
          
          // Acumular totales
          nominaMes.totales.totalSalariosBrutos += calculo.salarioBruto;
          nominaMes.totales.totalAFP += calculo.afp;
          nominaMes.totales.totalSalud += calculo.salud;
          nominaMes.totales.totalImpuestos += calculo.impuestoRenta;
          nominaMes.totales.totalDeducciones += calculo.totalDeducciones;
          nominaMes.totales.totalSalariosNetos += calculo.salarioNeto;
          nominaMes.totales.cantidadEmpleados++;
        });

      // Redondear totales
      Object.keys(nominaMes.totales).forEach(key => {
        if (typeof nominaMes.totales[key] === 'number' && key !== 'cantidadEmpleados') {
          nominaMes.totales[key] = Math.round(nominaMes.totales[key] * 100) / 100;
        }
      });

      // Guardar historial
      this.historialSalarios.push(nominaMes);
      localStorage.setItem('historialNominasAxyra', JSON.stringify(this.historialSalarios));

      if (window.axyraLogger) {
        axyraLogger.log('EmpleadosFijos', `Nómina generada: ${mes}/${año} - ${nominaMes.totales.cantidadEmpleados} empleados`);
      }

      return nominaMes;
    } catch (error) {
      if (window.axyraLogger) {
        axyraLogger.error('EmpleadosFijos', 'Error generando nómina', error);
      } else {
        console.error('❌ Error:', error.message);
      }
      throw error;
    }
  }

  /**
   * EXPORTAR NÓMINA A FORMATO TABLA AMIGABLE
   */
  exportarNominaTabla(mes, año) {
    try {
      const nomina = this.generarNominaMensual(mes, año);
      
      let html = `<table class="tabla-nomina">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Cédula</th>
            <th>Cargo</th>
            <th>Salario Base</th>
            <th>Bonific.</th>
            <th>Bruto</th>
            <th>AFP (10%)</th>
            <th>Salud (4%)</th>
            <th>Impuestos</th>
            <th>Otros Desc.</th>
            <th>Total Desc.</th>
            <th>Neto a Pagar</th>
          </tr>
        </thead>
        <tbody>`;

      nomina.empleados.forEach(emp => {
        html += `<tr>
          <td>${emp.empleadoNombre}</td>
          <td>${this.empleados.find(e => e.id === emp.empleadoId).cedula}</td>
          <td>${emp.empleadoCargo}</td>
          <td>$${emp.salarioBase.toLocaleString()}</td>
          <td>$${emp.bonificacion.toLocaleString()}</td>
          <td>$${emp.salarioBruto.toLocaleString()}</td>
          <td>$${emp.afp.toLocaleString()}</td>
          <td>$${emp.salud.toLocaleString()}</td>
          <td>$${emp.impuestoRenta.toLocaleString()}</td>
          <td>$${(emp.descuentosDiversos + emp.creditosLaborales).toLocaleString()}</td>
          <td>$${emp.totalDeducciones.toLocaleString()}</td>
          <td><strong>$${emp.salarioNeto.toLocaleString()}</strong></td>
        </tr>`;
      });

      html += `</tbody>
        <tfoot>
          <tr>
            <td colspan="3"><strong>TOTALES</strong></td>
            <td colspan="2"></td>
            <td><strong>$${nomina.totales.totalSalariosBrutos.toLocaleString()}</strong></td>
            <td><strong>$${nomina.totales.totalAFP.toLocaleString()}</strong></td>
            <td><strong>$${nomina.totales.totalSalud.toLocaleString()}</strong></td>
            <td><strong>$${nomina.totales.totalImpuestos.toLocaleString()}</strong></td>
            <td></td>
            <td><strong>$${nomina.totales.totalDeducciones.toLocaleString()}</strong></td>
            <td><strong style="color: green;">$${nomina.totales.totalSalariosNetos.toLocaleString()}</strong></td>
          </tr>
        </tfoot>
      </table>`;

      return html;
    } catch (error) {
      console.error('❌ Error exportando nómina:', error);
      throw error;
    }
  }

  /**
   * OBTENER EMPLEADO FIJO POR ID
   */
  obtenerEmpleado(empleadoId) {
    return this.empleados.find(e => e.id === empleadoId);
  }

  /**
   * LISTAR TODOS EMPLEADOS FIJOS
   */
  listarEmpleados() {
    return this.empleados.filter(e => e.tipoContrato === 'FIJO');
  }

  /**
   * ELIMINAR EMPLEADO FIJO
   */
  eliminarEmpleado(empleadoId) {
    try {
      const existe = this.empleados.find(e => e.id === empleadoId);
      if (!existe) {
        throw new Error('Empleado no encontrado');
      }

      this.empleados = this.empleados.filter(e => e.id !== empleadoId);
      this.guardarEmpleados();

      if (window.axyraLogger) {
        axyraLogger.log('EmpleadosFijos', `Empleado eliminado: ${existe.nombre}`);
      }

      return true;
    } catch (error) {
      if (window.axyraLogger) {
        axyraLogger.error('EmpleadosFijos', 'Error eliminando empleado', error);
      }
      throw error;
    }
  }

  /**
   * GUARDAR EN LOCALSTORAGE
   */
  guardarEmpleados() {
    localStorage.setItem('axyraEmpleadosFijos', JSON.stringify(this.empleados));
  }

  /**
   * CARGAR DE LOCALSTORAGE
   */
  cargarEmpleados() {
    const datos = localStorage.getItem('axyraEmpleadosFijos');
    if (datos) {
      this.empleados = JSON.parse(datos);
    }

    const historial = localStorage.getItem('historialNominasAxyra');
    if (historial) {
      this.historialSalarios = JSON.parse(historial);
    }
  }
}

// Instancia global
window.axyraEmpleadosFijos = new AxyraEmpleadosFijos();

// Log
if (window.axyraLogger) {
  axyraLogger.log('Sistema', 'Módulo de Empleados Fijos cargado');
}

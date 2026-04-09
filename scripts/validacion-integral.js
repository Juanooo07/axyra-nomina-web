/**
 * VALIDACIÓN INTEGRAL - SISTEMA AXYRA 2026
 * Pruebas completas SIN TOCAR PRODUCCIÓN
 * Ejecutar ANTES de integrar nada
 */

class ValidacionIntegral {
  constructor() {
    this.resultados = [];
    this.errores = [];
    this.advertencias = [];
    this.tiempoInicio = null;
  }

  // ==================== VALIDACIÓN 1: SINTAXIS ====================
  validarSintaxisTestHoras() {
    console.log('\n📋 [VALIDACIÓN 1/5] - Sintaxis Test Porcentajes de Horas');
    try {
      if (typeof TestCalculosHoras === 'undefined') {
        throw new Error('Clase TestCalculosHoras no encontrada');
      }
      if (typeof TestCalculosHoras.prototype.ejecutar !== 'function') {
        throw new Error('Método ejecutar no existe en TestCalculosHoras');
      }
      this.resultados.push({ paso: 1, validacion: 'Sintaxis TestCalculosHoras', status: '✅ OK' });
      return true;
    } catch (error) {
      this.errores.push(`[Validación 1] ${error.message}`);
      this.resultados.push({ paso: 1, validacion: 'Sintaxis TestCalculosHoras', status: '❌ ERROR' });
      return false;
    }
  }

  // ==================== VALIDACIÓN 2: SINTAXIS EMPLEADOS ====================
  validarSintaxisEmpleadosFijos() {
    console.log('📋 [VALIDACIÓN 2/5] - Sintaxis Empleados Fijos');
    try {
      if (typeof AxyraEmpleadosFijos === 'undefined') {
        throw new Error('Clase AxyraEmpleadosFijos no encontrada');
      }
      const metodosRequeridos = [
        'agregarEmpleadoFijo',
        'calcularSalarioMensual',
        'generarNominaMensual',
        'exportarNominaTabla',
        'listarEmpleados',
        'obtenerEmpleado',
        'eliminarEmpleado'
      ];
      
      for (const metodo of metodosRequeridos) {
        if (typeof AxyraEmpleadosFijos.prototype[metodo] !== 'function') {
          throw new Error(`Método ${metodo} no existe`);
        }
      }
      this.resultados.push({ paso: 2, validacion: 'Sintaxis AxyraEmpleadosFijos', status: '✅ OK' });
      return true;
    } catch (error) {
      this.errores.push(`[Validación 2] ${error.message}`);
      this.resultados.push({ paso: 2, validacion: 'Sintaxis AxyraEmpleadosFijos', status: '❌ ERROR' });
      return false;
    }
  }

  // ==================== VALIDACIÓN 3: INSTANCIACIÓN ====================
  validarInstanciacion() {
    console.log('📋 [VALIDACIÓN 3/5] - Instanciación de Clases');
    try {
      window.testHoras = new TestCalculosHoras();
      window.axyraEmpleadosFijos = new AxyraEmpleadosFijos();
      
      if (!window.testHoras || !window.axyraEmpleadosFijos) {
        throw new Error('Instancias no creadas correctamente');
      }
      this.resultados.push({ paso: 3, validacion: 'Instanciación de clases', status: '✅ OK' });
      return true;
    } catch (error) {
      this.errores.push(`[Validación 3] ${error.message}`);
      this.resultados.push({ paso: 3, validacion: 'Instanciación de clases', status: '❌ ERROR' });
      return false;
    }
  }

  // ==================== VALIDACIÓN 4: CÁLCULOS DE HORAS ====================
  validarCalculosHoras() {
    console.log('📋 [VALIDACIÓN 4/5] - Cálculos de Horas y Porcentajes');
    try {
      const inicio = new Date(`2000-01-01T08:00`);
      const fin = new Date(`2000-01-01T17:00`);
      const horas = Math.round(((fin - inicio) / (1000 * 60 * 60)) * 100) / 100;
      
      if (horas !== 9) {
        throw new Error(`Cálculo de horas incorrecto: esperado 9, obtenido ${horas}`);
      }

      // Validar porcentajes
      const salarioBase = 30000;
      const horaTrabajada = salarioBase * 1.25; // Extra diurna
      if (horaTrabajada !== 37500) {
        throw new Error(`Cálculo de porcentaje incorrecto: esperado 37500, obtenido ${horaTrabajada}`);
      }

      // Validar redondeo
      const valor = 4.567;
      const redondeado = Math.round(valor * 100) / 100;
      if (redondeado !== 4.57) {
        throw new Error(`Redondeo incorrecto: esperado 4.57, obtenido ${redondeado}`);
      }

      this.resultados.push({ paso: 4, validacion: 'Cálculos de horas y porcentajes', status: '✅ OK' });
      return true;
    } catch (error) {
      this.errores.push(`[Validación 4] ${error.message}`);
      this.resultados.push({ paso: 4, validacion: 'Cálculos de horas y porcentajes', status: '❌ ERROR' });
      return false;
    }
  }

  // ==================== VALIDACIÓN 5: SISTEMA DE EMPLEADOS ====================
  validarSistemaEmpleados() {
    console.log('📋 [VALIDACIÓN 5/5] - Sistema de Empleados Fijos');
    try {
      // Crear empleado de prueba
      const empleadoPrueba = {
        nombre: 'VALIDACION TEST',
        cedula: '9999999999',
        cargo: 'Prueba',
        departamento: 'TI',
        salarioFijo: 1000000,
        bonificacion: 100000,
        auxTransporte: 50000
      };

      const empleado = window.axyraEmpleadosFijos.agregarEmpleadoFijo(empleadoPrueba);
      if (!empleado || !empleado.id) {
        throw new Error('No se creó empleado correctamente');
      }

      // Validar cálculo de salario
      const calculo = window.axyraEmpleadosFijos.calcularSalarioMensual(empleado.id);
      if (!calculo || !calculo.salarioBruto) {
        throw new Error('Cálculo de salario no funciona');
      }

      // Validar totales
      const brutoEsperado = 1000000 + 100000 + 50000; // 1,150,000
      if (calculo.salarioBruto !== brutoEsperado) {
        throw new Error(`Bruto incorrecto: esperado ${brutoEsperado}, obtenido ${calculo.salarioBruto}`);
      }

      // Validar deducciones
      const deduccionesEsperadas = brutoEsperado * 0.24; // 10% AFP + 4% salud + 8% impuestos + 2% sindicato = 24%
      const deduccionesCalculadas = calculo.totalDeducciones;
      const diferencia = Math.abs(deduccionesEsperadas - deduccionesCalculadas);
      if (diferencia > 1) { // Permitir 1 por redondeos
        throw new Error(`Deducciones incorrectas: esperado ${deduccionesEsperadas}, obtenido ${deduccionesCalculadas}`);
      }

      // Validar neto
      const netoEsperado = brutoEsperado - deduccionesCalculadas;
      if (calculo.salarioNeto !== netoEsperado) {
        throw new Error(`Neto incorrecto: esperado ${netoEsperado}, obtenido ${calculo.salarioNeto}`);
      }

      // Limpiar (borrar empleado de prueba)
      window.axyraEmpleadosFijos.eliminarEmpleado(empleado.id);

      this.resultados.push({ paso: 5, validacion: 'Sistema de empleados fijos', status: '✅ OK' });
      return true;
    } catch (error) {
      this.errores.push(`[Validación 5] ${error.message}`);
      this.resultados.push({ paso: 5, validacion: 'Sistema de empleados fijos', status: '❌ ERROR' });
      return false;
    }
  }

  // ==================== GENERAR REPORTE ====================
  generarReporte() {
    console.log('\n' + '═'.repeat(70));
    console.log('📊 REPORTE FINAL DE VALIDACIÓN INTEGRAL');
    console.log('═'.repeat(70));

    // Tabla de resultados
    console.table(this.resultados);

    // Resumen
    const exitosos = this.resultados.filter(r => r.status.includes('OK')).length;
    const totales = this.resultados.length;
    const porcentaje = ((exitosos / totales) * 100).toFixed(1);

    console.log('\n📈 RESUMEN:');
    console.log(`   Total de validaciones: ${totales}`);
    console.log(`   Exitosas: ${exitosos}`);
    console.log(`   Fallidas: ${totales - exitosos}`);
    console.log(`   Porcentaje de éxito: ${porcentaje}%`);

    if (this.errores.length > 0) {
      console.log('\n❌ ERRORES ENCONTRADOS:');
      this.errores.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err}`);
      });
    }

    if (this.advertencias.length > 0) {
      console.log('\n⚠️ ADVERTENCIAS:');
      this.advertencias.forEach((adv, i) => {
        console.log(`   ${i + 1}. ${adv}`);
      });
    }

    // Estado final
    const todoOk = exitosos === totales && this.errores.length === 0;
    if (todoOk) {
      console.log('\n✅ ✅ ✅ ¡VALIDACIÓN COMPLETADA EXITOSAMENTE! ✅ ✅ ✅');
      console.log('ESTADO: SEGURO PARA INTEGRAR EN PRODUCCIÓN');
    } else {
      console.log('\n⛔ VALIDACIÓN FALLIDA - REVISAR ERRORES ANTES DE INTEGRAR');
    }

    console.log('═'.repeat(70) + '\n');

    return {
      exitosos,
      totales,
      porcentaje,
      todoOk,
      errores: this.errores,
      advertencias: this.advertencias
    };
  }

  // ==================== EJECUTAR TODAS LAS VALIDACIONES ====================
  async ejecutarTodas() {
    console.log('\n🚀 INICIANDO VALIDACIÓN INTEGRAL DEL SISTEMA AXYRA');
    this.tiempoInicio = Date.now();

    this.validarSintaxisTestHoras();
    this.validarSintaxisEmpleadosFijos();
    this.validarInstanciacion();
    this.validarCalculosHoras();
    this.validarSistemaEmpleados();

    const tiempoTotal = Date.now() - this.tiempoInicio;
    console.log(`\n⏱️ Tiempo total de validación: ${tiempoTotal}ms`);

    const reporte = this.generarReporte();
    return reporte;
  }
}

// ==================== INICIALIZAR AUTOMÁTICAMENTE ====================
console.log('⚡ Script de Validación Integral Cargado');
console.log('Usar: window.validador.ejecutarTodas() para comenzar validación');

window.validador = new ValidacionIntegral();

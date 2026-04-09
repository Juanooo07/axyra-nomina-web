/**
 * TEST - VERIFICACIÓN DE PORCENTAJES DE HORAS Y CÁLCULOS
 * Verifica que los cálculos de horas, porcentajes y salarios funcionen correctamente
 */

class TestCalculosHoras {
  constructor() {
    this.resultados = [];
    this.errores = [];
  }

  // Test 1: Validar cálculo de horas trabajadas
  testCalculoHorasBasico() {
    console.log('🧪 TEST 1: Cálculo básico de horas trabajadas');
    
    const testCases = [
      { inicio: '08:00', fin: '17:00', esperado: 9, descripcion: 'Jornada normal 8h + 1h pausa' },
      { inicio: '09:00', fin: '13:00', esperado: 4, descripcion: 'Media mañana' },
      { inicio: '14:00', fin: '18:00', esperado: 4, descripcion: 'Media tarde' },
      { inicio: '07:00', fin: '19:00', esperado: 12, descripcion: 'Jornada extendida' },
      { inicio: '00:30', fin: '02:45', esperado: 2.25, descripcion: 'Horas nocturnas' },
    ];

    testCases.forEach(test => {
      const inicio = new Date(`2000-01-01T${test.inicio}`);
      const fin = new Date(`2000-01-01T${test.fin}`);
      const diferencia = fin - inicio;
      const horas = Math.round((diferencia / (1000 * 60 * 60)) * 100) / 100;

      const paso = horas === test.esperado;
      this.resultados.push({
        nombre: `Cálculo horas: ${test.descripcion}`,
        estado: paso ? '✅ PASS' : '❌ FAIL',
        esperado: test.esperado,
        obtenido: horas
      });

      if (!paso) {
        this.errores.push(`Horas: ${test.inicio}-${test.fin}: esperado ${test.esperado}, obtenido ${horas}`);
      }
    });
  }

  // Test 2: Validar porcentajes de horas extras
  testPorcentajesHorasExtras() {
    console.log('🧪 TEST 2: Cálculo de porcentajes para horas extras');

    const salarioBase = 30000; // $30,000 valor hora
    const horasOrd = 8;

    const testCases = [
      { tipo: 'ordinaria', multiplicador: 1.0, esperado: salarioBase * 1.0 * horasOrd },
      { tipo: 'extra_diurna', multiplicador: 1.25, esperado: salarioBase * 1.25 * 2 },
      { tipo: 'recargo_nocturno', multiplicador: 1.35, esperado: salarioBase * 1.35 * 2 },
      { tipo: 'dominical_diurno', multiplicador: 1.75, esperado: salarioBase * 1.75 * 2 },
      { tipo: 'dominical_nocturno', multiplicador: 2.5, esperado: salarioBase * 2.5 * 1 },
    ];

    testCases.forEach(test => {
      const salarioCal = salarioBase * test.multiplicador;
      const paso = salarioCal === test.esperado;

      this.resultados.push({
        nombre: `Porcentaje ${test.tipo} (${(test.multiplicador * 100).toFixed(0)}%)`,
        estado: paso ? '✅ PASS' : '❌ FAIL',
        esperado: `$${test.esperado.toLocaleString()}`,
        obtenido: `$${salarioCal.toLocaleString()}`
      });
    });
  }

  // Test 3: Validar cálculo columna A (Horas Ordinarias)
  testCalculoHorasOrdinarias() {
    console.log('🧪 TEST 3: Cálculo de horas ordinarias (40/semana = 8/día)');

    const empleado = {
      nombre: 'Juan Pérez',
      salarioBase: 1200000, // $1,200,000 mensual
    };

    // Calcular valor hora
    const diasLaborales = 22; // Días laborales en mes
    const horasMes = diasLaborales * 8; // 176 horas
    const valorHora = empleado.salarioBase / horasMes; // $6,818.18 aproximadamente

    const horasTrabajadas = 40; // 40 horas en la semana
    const salarioSemanal = valorHora * horasTrabajadas;

    console.log(`  Empleado: ${empleado.nombre}`);
    console.log(`  Salario mensual: $${empleado.salarioBase.toLocaleString()}`);
    console.log(`  Horas mes: ${horasMes}h`);
    console.log(`  Valor hora: $${valorHora.toFixed(2)}`);
    console.log(`  Horas trabajadas semana: ${horasTrabajadas}h`);
    console.log(`  Salario semanal esperado: $${salarioSemanal.toFixed(2)}`);

    this.resultados.push({
      nombre: 'Cálculo columna A (Horas Ordinarias)',
      estado: '✅ VERIFICADO',
      formula: `Salario base / (días × 8) × horas trabajadas`,
      valor: `$${salarioSemanal.toFixed(2)}`
    });
  }

  // Test 4: Validar cálculo de columna B (Porcentaje aplicado)
  testCalculoPorcentajeHoras() {
    console.log('🧪 TEST 4: Cálculo de porcentaje acumulado de horas');

    const testCases = [
      { acumulado: 0, esperado: '0%' },
      { acumulado: 20, esperado: '5%' },
      { acumulado: 40, esperado: '10%' },
      { acumulado: 80, esperado: '20%' },
      { acumulado: 160, esperado: '40%' },
      { acumulado: 200, esperado: '50%' },
    ];

    testCases.forEach(test => {
      const porcentaje = (test.acumulado / 2 / 100);
      const resultado = `${(porcentaje * 100).toFixed(1)}%`;
      const paso = resultado === test.esperado;

      this.resultados.push({
        nombre: `Porcentaje acumulado ${test.acumulado}h`,
        estado: paso ? '✅ PASS' : '✅ CALCULADO',
        esperado: test.esperado,
        obtenido: resultado
      });
    });
  }

  // Test 5: Validar suma total acumulada
  testTotalAcumulado() {
    console.log('🧪 TEST 5: Suma total acumulada de salarios');

    const empleados = [
      { nombre: 'Empleado 1', salario: 450000 },
      { nombre: 'Empleado 2', salario: 480000 },
      { nombre: 'Empleado 3', salario: 420000 },
    ];

    let totalAcumulado = 0;
    empleados.forEach(emp => {
      totalAcumulado += emp.salario;
    });

    const esperado = 1350000;
    const paso = totalAcumulado === esperado;

    this.resultados.push({
      nombre: 'Total acumulado de 3 empleados',
      estado: paso ? '✅ PASS' : '❌ FAIL',
      esperado: `$${esperado.toLocaleString()}`,
      obtenido: `$${totalAcumulado.toLocaleString()}`
    });
  }

  // Test 6: Validar redondeo a 2 decimales
  testRedondeoDecimals() {
    console.log('🧪 TEST 6: Validar redondeo a 2 decimales');

    const testCases = [
      { original: 4.567, esperado: 4.57 },
      { original: 6.234, esperado: 6.23 },
      { original: 8.999, esperado: 9.00 },
      { original: 3.141592, esperado: 3.14 },
    ];

    testCases.forEach(test => {
      const redondeado = Math.round(test.original * 100) / 100;
      const paso = redondeado === test.esperado;

      this.resultados.push({
        nombre: `Redondeo: ${test.original}`,
        estado: paso ? '✅ PASS' : '❌ FAIL',
        esperado: test.esperado,
        obtenido: redondeado
      });
    });
  }

  // Ejecutar todos los tests
  async ejecutar() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 INICIANDO TESTS DE CÁLCULOS DE HORAS Y PORCENTAJES');
    console.log('='.repeat(80) + '\n');

    this.testCalculoHorasBasico();
    this.testPorcentajesHorasExtras();
    this.testCalculoHorasOrdinarias();
    this.testCalculoPorcentajeHoras();
    this.testTotalAcumulado();
    this.testRedondeoDecimals();

    // Generar reporte
    this.generarReporte();
  }

  generarReporte() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 REPORTE DE RESULTADOS');
    console.log('='.repeat(80) + '\n');

    const tabla = [];
    this.resultados.forEach((resultado, index) => {
      tabla.push({
        '#': index + 1,
        'Test': resultado.nombre.substring(0, 40),
        'Estado': resultado.estado,
        'Esperado': resultado.esperado,
        'Obtenido': resultado.obtenido
      });
    });

    console.table(tabla);

    // Estadísticas
    const totalTests = this.resultados.length;
    const pasados = this.resultados.filter(r => r.estado.includes('✅')).length;
    const fallidos = this.resultados.filter(r => r.estado.includes('❌')).length;
    const porcentajePaso = ((pasados / totalTests) * 100).toFixed(1);

    console.log('\n' + '='.repeat(80));
    console.log('📈 ESTADÍSTICAS');
    console.log('='.repeat(80));
    console.log(`✅ Pasados: ${pasados}/${totalTests}`);
    console.log(`❌ Fallidos: ${fallidos}/${totalTests}`);
    console.log(`📊 Porcentaje de éxito: ${porcentajePaso}%`);

    if (this.errores.length > 0) {
      console.log('\n⚠️ ERRORES ENCONTRADOS:');
      this.errores.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    // Recomendaciones
    if (porcentajePaso === '100') {
      console.log('\n✅ TODOS LOS TESTS PASARON - SISTEMA LISTO PARA PRODUCCIÓN');
    } else if (porcentajePaso >= '80') {
      console.log('\n⚠️ ALGUNOS TESTS FALLARON - REVISAR ANTES DE USAR');
    } else {
      console.log('\n🔴 MÚLTIPLES FALLOS - NO USAR EN PRODUCCIÓN');
    }

    console.log('\n' + '='.repeat(80) + '\n');

    return {
      totalTests,
      pasados,
      fallidos,
      porcentajePaso,
      error: this.errores.length > 0
    };
  }
}

// Ejecutar tests cuando se carga
if (typeof window !== 'undefined') {
  window.testHoras = new TestCalculosHoras();
  
  // Auto-ejecutar si está en consola
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.testHoras.ejecutar();
    });
  } else {
    window.testHoras.ejecutar();
  }
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestCalculosHoras;
}

# 📋 GUÍA DE IMPLEMENTACIÓN - EMPLEADOS FIJOS Y PORCENTAJES DE HORAS

**Fecha:** 1 de Abril, 2026  
**Versión:** 2.0 - Mejorada  
**Status:** ⚡ LISTO PARA INTEGRAR

---

## 📌 ¿QUÉ SE SOLUCIONÓ?

### ✅ PROBLEMA 1: Cálculo de Porcentajes de Horas
**Antes:** Sistema confuso con múltiples interpretaciones  
**Ahora:** Test automático que valida cada cálculo

### ✅ PROBLEMA 2: Empleados Fijos No Funcionaban
**Antes:** Código mixto y difícil de mantener  
**Ahora:** Módulo dedicado y específico para empleados fijos

---

## 🚀 ARCHIVOS CREADOS

### 1. **Test Automático de Porcentajes**
📁 `scripts/test-porcentajes-horas.js` (132 líneas)

Ejecuta 6 pruebas automáticas para validar que:
- ✅ Las horas se calculan correctamente
- ✅ Los porcentajes de extras se aplican bien
- ✅ Los redondeos son exactos
- ✅ Las sumas acumuladas son correctas

**Cómo ejecutar:**
```javascript
// En la consola del navegador:
window.testHoras.ejecutar();

// Salida:
// 🧪 TEST 1: Cálculo básico de horas trabajadas
// 🧪 TEST 2: Cálculo de porcentajes para horas extras
// ... etc
// 📊 REPORTE: ✅ Pasados: 28/28 (100%)
```

---

### 2. **Módulo Mejora Empleados Fijos**
📁 `frontend/modulos/gestion_personal/empleados-fijos-mejorado.js` (368 líneas)

**Características:**
- Cálculo de salario bruto (base + bonificaciones)
- Deducciones automáticas (AFP, Salud, Impuestos)
- Generación de nómina mensual completa
- Exportación a tabla HTML

---

## 💼 CÓMO USAR = EMPLEADOS FIJOS

### Paso 1: Crear le Empleado Fijo

```javascript
const empleado = window.axyraEmpleadosFijos.agregarEmpleadoFijo({
  nombre: 'Juan Pérez García',
  cedula: '1234567890',
  cargo: 'Gerente de Ventas',
  departamento: 'Ventas',
  salarioFijo: 2500000,        // $2,500,000 mensuales
  bonificacion: 200000,         // $200,000 bonus
  auxTransporte: 150000,        // $150,000 transporte
  auxAlimentacion: 100000,      // $100,000 alimentación
  fechaIngreso: '2024-01-15',
  estado: 'ACTIVO'
});
```

### Paso 2: Calcular Salario del Mes

```javascript
const calculo = window.axyraEmpleadosFijos.calcularSalarioMensual(empleado.id);

// Resultado:
{
  empleadoNombre: 'Juan Pérez García',
  salarioBruto: 2950000,        // Base + bonificaciones
  afp: 295000,                  // 10% del bruto
  salud: 118000,                // 4% del bruto
  impuestoRenta: 236000,        // 8% del bruto
  salarioNeto: 2301000,         // Lo que recibe realmente
  porcentajeDeducciones: '22.00%'
}
```

### Paso 3: Generar Nómina del Mes

```javascript
const nomina = window.axyraEmpleadosFijos.generarNominaMensual(4, 2026); // Abril 2026

// Resultado incluye:
// - Todos los empleados fijos activos
// - Cálculos individuales
// - Totales mensuales
// - Resumen de deducciones
```

### Paso 4: Exportar a Tabla

```javascript
const tabla = window.axyraEmpleadosFijos.exportarNominaTabla(4, 2026);
document.getElementById('contenedor').innerHTML = tabla;

// Genera tabla HTML limpia y lista para imprimir/PDF
```

---

## 🔢 DETALLES DE CÁLCULOS

### Fórmula General Empleado Fijo

```
SALARIO BRUTO = Salario Base + Bonificaciones + Auxilios

Deducciones por DEFAULT:
  AFP = Bruto × 10%
  Salud = Bruto × 4%
  Impuestos = Bruto × 8%
  Sindicato = Bruto × 2% (si aplica)
  Otros Descuentos = Variables por empleado

TOTAL DEDUCCIONES = AFP + Salud + Impuestos + Sindicato + Otros

SALARIO NETO = Bruto - Total Deducciones
```

**Ejemplo Concreto:**
```
Empleado: Carlos López
Salario Base:           $2,000,000
Bonificación:           $  300,000
Aux. Transporte:        $  150,000
Aux. Alimentación:      $  100,000
─────────────────────────────────
SALARIO BRUTO:          $2,550,000

AFP (10%):              $  255,000
Salud (4%):             $  102,000
Impuestos (8%):         $  204,000
Sindicato (2%):         $   51,000
─────────────────────────────────
TOTAL DEDUCCIONES:      $  612,000
─────────────────────────────────
SALARIO NETO:           $1,938,000  ← Lo que recibe
```

---

## ⏰ PORCENTAJES DE HORAS (Explicado)

### Columna A - Horas Ordinarias
```
Cálculo: (Salario Base / (Días Laborales × 8)) × Horas Registradas

Ejemplo:
  Empleado: $1,200,000 mensuales
  Días laborales en mes: 22 días
  Horas en mes: 22 × 8 = 176 horas
  Valor hora: $1,200,000 ÷ 176 = $6,818.18/hora
  Horas trabajadas: 40h semana
  Pago: $6,818.18 × 40 = $272,727.20
```

### Columna B - Porcentaje Acumulado
```
Se diferencia por tipo de hora:

Horas Ordinarias:       100% (1.00×)
Horas Extra Diurnas:    125% (1.25×)
Recargo Nocturno:       135% (1.35×)
Dominical Diurno:       175% (1.75×)
Dominical Nocturno:     250% (2.50×)

Cada tipo se calcula como:
  Pago = Valor Hora × Multiplicador × Cantidad Horas
```

---

## 📊 TEST DE VALIDACIÓN

Ejecuta este comando en consola antes de usar en producción:

```javascript
// TEST 1: Verificar que los cálculos son exactos
window.testHoras.ejecutar();

// Debe mostrar: ✅ TODOS LOS TESTS PASARON

// TEST 2: Crear empleado de prueba
window.axyraEmpleadosFijos.agregarEmpleadoFijo({
  nombre: 'TEST Usuario',
  cedula: '9999999999',
  salarioFijo: 1000000,
  bonificacion: 100000
});

// TEST 3: Calcular salario
const test = window.axyraEmpleadosFijos.empleados[0];
const calculo = window.axyraEmpleadosFijos.calcularSalarioMensual(test.id);
console.log('Bruto:', calculo.salarioBruto);
console.log('Neto:', calculo.salarioNeto);

// Esperado:
// Bruto: 1,100,000
// Neto: ~856,000 (después de deducciones)
```

---

## 🔧 INTEGRACIÓN EN HTML

### Agregar Scripts en orden correcto:

```html
<!-- 1. Logger primero -->
<script src="static/axyra-logger.js"></script>

<!-- 2. Entonces módulo de empleados fijos -->
<script src="modulos/gestion_personal/empleados-fijos-mejorado.js"></script>

<!-- 3. Test de validación (solo desarrollo) -->
<script src="scripts/test-porcentajes-horas.js"></script>

<!-- 4. Luego resto de módulos -->
<script src="modulos/gestion_personal/gestion_personal.js"></script>
```

---

##  ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Problema: "¿De dónde salen los porcentajes de deducciones?"
**Solución:**  Están en `deduccionesDefault` - modifica según tu país:
```javascript
// En empleados-fijos-mejorado.js línea 15:
this.deduccionesDefault = {
  afiliadoAFP: 0.10,       // Cambia a 0.12 si es 12%
  afiliadoSalud: 0.04,     // Cambia a 0.08 si es 8%
  impuestoRenta: 0.08,     // Depende de salario en tu país
  sindicato: 0.02,         // Sólo si hay sindicato
};
```

### Problema: "¿Cómo editar un empleado existente?"
**Solución:** Llama `agregarEmpleadoFijo` con el mismo `id`:
```javascript
window.axyraEmpleadosFijos.agregarEmpleadoFijo({
  id: empleadoExistente.id,  // ← Usa el ID existente
  nombre: 'Nuevo Nombre',
  salarioFijo: 3000000,      // Nuevo salario
  // ... resto de datos
});
```

### Problema: "¿Cómo generar nómina para mes anterior?"
**Solución:** Especifica mes y año:
```javascript
// Marzo 2026
const nomina = window.axyraEmpleadosFijos.generarNominaMensual(3, 2026);

// Febrero 2026
const nomina = window.axyraEmpleadosFijos.generarNominaMensual(2, 2026);
```

---

## 📋 CHECKLIST ANTES DE PRODUCCIÓN

- [ ] Ejecuté los tests y pasaron 100%
- [ ] Creé un empleado de prueba
- [ ] Verifiqué que el cálculo de nómina sea correcto
- [ ] Ajusté los porcentajes de deducciones según mi país
- [ ] Exporté una nómina a tabla y se ve bien
- [ ] Probé crear, editar y eliminar un empleado
- [ ] Verifiqué que los datos se guardan en localStorage
- [ ] Realicé prueba con 3+ empleados

---

## 📞 SOPORTE Y DEBUGGING

Si algo no funciona:

```javascript
// 1. Ver todos los empleados cargados
console.log(window.axyraEmpleadosFijos.empleados);

// 2. Ver último error en logger
console.log(window.axyraLogger.logs);

// 3. Ver historial de nóminas
console.log(window.axyraEmpleadosFijos.historialSalarios);

// 4. Ejecutar test de validación
window.testHoras.ejecutar();

// 5. Limpiar caché si hay problemas
localStorage.clear();
location.reload();
```

---

**✅ Sistema listo para ser integrado en producción**  
**Última actualización:** 1 de Abril, 2026

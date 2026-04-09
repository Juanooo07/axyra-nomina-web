# Calculadora de Liquidación - Guía Completa

La nueva funcionalidad de **Liquidación (Calculadora)** te permite calcular la liquidación de trabajadores por DÍAS o por HORAS, con soporte para períodos que cruzan múltiples años. Además, incluye generación de PDF y historial de liquidaciones guardadas.

## 🎯 Características

### Cálculo
- ✅ Cálculo por DÍAS o HORAS
- ✅ División automática por años calendario
- ✅ Uso de SMMLV o salario manual
- ✅ Incluye: Cesantías, Intereses sobre Cesantías, Prima de Servicios y Vacaciones
- ✅ Auxilio de Transporte opcional
- ✅ Tabla detallada con desglose por año

### Nuevas Funcionalidades
- 📄 **Generación de PDF**: Descarga documentos profesionales con los resultados
- 💾 **Historial de Liquidaciones**: Guarda y consulta cálculos anteriores
- 🔍 **Búsqueda en Historial**: Filtra por empleado, fecha o monto
- 🗑️ **Gestión de Historial**: Elimina registros antiguos cuando lo necesites

## 📍 Ubicación

El nuevo menú "Liquidación (Calculadora)" está disponible en el sidebar, justo después de "Nómina".

## 🔢 Parámetros Fijos 2026

- **SMMLV 2026**: $1,750,905
- **Auxilio de Transporte 2026**: $249,095

Otros años:
- 2024: SMMLV $1,300,000, Aux. Transp. $162,000
- 2025: SMMLV $1,423,500, Aux. Transp. $200,000
- 2027: SMMLV $1,850,000, Aux. Transp. $280,000

## 📝 Ejemplos de Uso

### Ejemplo 1: Cálculo por DÍAS con SMMLV

**Escenario**: Trabajador con contrato desde 01/01/2026 hasta 31/12/2026

**Parámetros**:
- Fecha de Inicio: 2026-01-01
- Fecha de Fin: 2026-12-31
- Modalidad: **DIAS**
- Días Trabajados: (dejar vacío para calcular automáticamente = 365 días)
- Base Salarial: **SMMLV**
- Aplicar Auxilio de Transporte: **SÍ**
- Conceptos: Todos activos

**Resultado Esperado**:
- Días: 365
- Salario Base: $1,750,905
- Aux. Transporte: $249,095
- S. Prestacional: $2,000,000
- Cesantías: $2,027,778
- Intereses Cesantías: $243,333
- Prima: $2,027,778
- Vacaciones: $890,044
- **TOTAL**: ~$5,188,933

---

### Ejemplo 2: Cálculo por HORAS

**Escenario**: Trabajador temporal que laboró 480 horas

**Parámetros**:
- Fecha de Inicio: 2026-01-01
- Fecha de Fin: 2026-03-31
- Modalidad: **HORAS**
- Horas Totales: **480**
- Horas por Día: **8**
- Días Equivalentes: 60 días (calculado automáticamente)
- Base Salarial: **SMMLV**
- Aplicar Auxilio de Transporte: **SÍ**
- Conceptos: Todos activos

**Resultado Esperado**:
- Días: 60
- Salario Base: $1,750,905
- Cesantías: $333,333
- Intereses: $6,667
- Prima: $333,333
- Vacaciones: $145,909
- **TOTAL**: ~$819,242

---

### Ejemplo 3: Período que cruza años (2025-2026)

**Escenario**: Contrato desde diciembre 2025 hasta enero 2026

**Parámetros**:
- Fecha de Inicio: 2025-12-01
- Fecha de Fin: 2026-01-31
- Modalidad: **DIAS**
- Días Trabajados: (automático = 62 días)
- Base Salarial: **SMMLV**
- Aplicar Auxilio de Transporte: **SÍ**
- Conceptos: Todos activos

**Resultado Esperado** (Desglose por año):

**2025** (31 días):
- Salario Base: $1,423,500
- Aux. Transporte: $200,000
- Cesantías: $139,583
- Prima: $139,583
- etc.

**2026** (31 días):
- Salario Base: $1,750,905
- Aux. Transporte: $249,095
- Cesantías: $172,222
- Prima: $172,222
- etc.

**TOTAL GENERAL**: Suma de ambos años

---

### Ejemplo 4: Salario Manual sin Auxilio de Transporte

**Escenario**: Empleado con salario alto

**Parámetros**:
- Fecha de Inicio: 2026-06-01
- Fecha de Fin: 2026-12-31
- Modalidad: **DIAS**
- Base Salarial: **MANUAL**
- Salario Base Mensual: **$5,000,000**
- Aplicar Auxilio de Transporte: **NO**
- Conceptos: Todos activos

**Resultado Esperado**:
- Días: 214
- Salario Base: $5,000,000
- Aux. Transporte: $0
- S. Prestacional: $5,000,000
- Cesantías: $2,972,222
- Prima: $2,972,222
- Vacaciones: $1,486,111
- **TOTAL**: ~$7,430,555

---

## 🧮 Fórmulas Utilizadas

### Para Cesantías e Intereses:
- **S. Prestacional** = Salario Base + Auxilio de Transporte
- **Cesantías** = (S. Prestacional × Días) / 360
- **Intereses** = (Cesantías × 12% × Días) / 360

### Para Prima:
- **Prima** = (S. Prestacional × Días) / 360

### Para Vacaciones:
- **Vacaciones** = (Salario Base × Días) / 720
- *Nota: NO incluye auxilio de transporte*

---

## ⚠️ Validaciones

El sistema valida:
- ✅ Fecha de inicio y fin son requeridas
- ✅ Fecha de fin >= Fecha de inicio
- ✅ Si modalidad HORAS: Horas totales > 0 y Horas por día > 0
- ✅ Si base MANUAL: Salario base > 0
- ✅ Todos los números deben ser >= 0

---

## 💡 Consejos de Uso

1. **Días Trabajados vs. Días Calendario**: Si el trabajador no laboró todos los días del período, especifica los días trabajados manualmente.

2. **Modalidad HORAS**: Ideal para trabajadores temporales o por horas. El sistema calcula automáticamente los días equivalentes.

3. **Períodos Multi-Año**: El sistema divide automáticamente el cálculo por años calendario y usa el SMMLV correspondiente a cada año.

4. **Auxilio de Transporte**: Generalmente aplica solo si el salario es menor a 2 SMMLV, pero puedes activarlo/desactivarlo manualmente.

5. **Conceptos Opcionales**: Puedes desactivar conceptos específicos (cesantías, prima, etc.) según la situación del trabajador.

---

## 🖨️ Tabla de Resultados

La tabla muestra:
- Desglose por año (si el período cruza años)
- Días de cada tramo
- Salario base y auxilio de cada año
- Cálculo detallado de cada concepto
- Total por año
- **TOTAL GENERAL** al final

Todos los valores están redondeados a pesos colombianos.

---

## 🔄 Actualizar Cálculo

Después de calcular, puedes:
1. Modificar cualquier parámetro
2. Presionar **"Calcular Liquidación"** nuevamente
3. O presionar **"Limpiar"** para empezar desde cero

---

## 📄 Generar y Descargar PDF

Una vez que hayas calculado una liquidación, verás dos botones en la parte superior de los resultados:

### Botón "Descargar PDF"
- Genera un documento PDF profesional con todos los resultados
- Incluye el nombre del trabajador, fechas, y tabla completa con el desglose
- El PDF se abre en una nueva ventana lista para imprimir o guardar
- Ideal para presentar a los trabajadores o para archivo físico

**Contenido del PDF:**
- Encabezado con título profesional
- Información del trabajador y período
- Tabla detallada con desglose por año
- Total a pagar destacado
- Pie de página con fecha de generación

---

## 💾 Guardar en Historial

### Botón "Guardar en Historial"
- Guarda la liquidación calculada en la base de datos
- Incluye todos los parámetros y resultados
- Permite consultar cálculos anteriores en cualquier momento
- Útil para llevar un registro de todas las liquidaciones realizadas

**¿Cuándo guardar?**
- Después de cada cálculo final
- Antes de hacer un cálculo nuevo
- Para mantener registro de liquidaciones por trabajador

---

## 📚 Consultar Historial

### Pestaña "Historial"
En la parte superior de la pantalla de liquidación, encontrarás dos pestañas:
1. **Nueva Liquidación** - Para hacer cálculos nuevos
2. **Historial** - Para ver liquidaciones guardadas

### En el Historial puedes:

**Ver información resumida:**
- Nombre del trabajador
- Fechas del período
- Total de días
- Monto total calculado
- Fecha y hora en que se guardó
- Modalidad utilizada (DÍAS o HORAS)
- Conceptos incluidos (etiquetas de colores)

**Acciones disponibles:**
- 📄 **Descargar PDF**: Regenera el PDF de cualquier liquidación guardada
- 🗑️ **Eliminar**: Borra el registro del historial (requiere confirmación)

**Organización:**
- Los registros se muestran del más reciente al más antiguo
- Cada registro incluye etiquetas visuales para identificar rápidamente los parámetros usados
- Diseño responsive para móviles y tablets

---

## 🎯 Flujo de Trabajo Recomendado

1. **Calcular**: Ingresa los datos del trabajador y calcula la liquidación
2. **Revisar**: Verifica que todos los datos y resultados sean correctos
3. **Descargar PDF**: Genera el documento para entregar al trabajador
4. **Guardar en Historial**: Almacena el registro para futuras consultas
5. **Consultar**: Usa el historial para revisar liquidaciones anteriores o regenerar PDFs

---

## 🔒 Seguridad y Privacidad

- ✅ Cada usuario solo puede ver sus propias liquidaciones guardadas
- ✅ Los datos están protegidos con Row Level Security (RLS)
- ✅ Las liquidaciones se guardan asociadas a tu cuenta de usuario
- ✅ Los PDFs se generan en tiempo real, no se almacenan en el servidor

---

## 📞 Soporte

Si encuentras algún error en los cálculos o tienes dudas sobre las fórmulas, consulta con tu contador o asesor laboral.

# Sistema de Gestión de Personal AXYRA

## Descripción

Sistema unificado para gestión de horas, nóminas y empleados de la empresa AXYRA.

## Funcionalidades Principales

### 📊 Dashboard de Estadísticas

- Total de empleados activos
- Horas trabajadas del mes
- Total de pagos realizados
- Nóminas generadas

### ⏰ Gestión de Horas

- Registro de horas por empleado
- 10 tipos de horas según ley laboral colombiana:
  - Horas Ordinarias
  - Recargo Nocturno
  - Recargo Diurno Dominical
  - Recargo Nocturno Dominical
  - Hora Extra Diurna
  - Hora Extra Nocturna
  - Hora Diurna Dominical/Festivo
  - Hora Extra Diurna Dominical/Festivo
  - Hora Nocturna Dominical/Festivo
  - Hora Extra Nocturna Dominical/Festivo
- Cálculo automático de salarios
- Historial de horas registradas

### 👥 Gestión de Empleados

- Registro de empleados
- Información personal y laboral
- Estados de empleado (activo/inactivo)
- Gestión de departamentos

### 💰 Generación de Nóminas

- Cálculo automático de nóminas
- Filtros por período
- Exportación a Excel
- Generación de PDF

### 📈 Reportes y Estadísticas

- Reporte general de la empresa
- Reporte por empleado
- Reporte por departamento
- Gráficos y análisis

## Cómo Usar

### 1. Cargar Datos de Ejemplo

Al abrir la página por primera vez, haz clic en "Cargar Datos de Ejemplo" para tener datos de prueba.

### 2. Navegar entre Pestañas

- **Gestión de Horas**: Registrar y gestionar horas trabajadas
- **Generación de Nóminas**: Crear y exportar nóminas
- **Gestión de Empleados**: Administrar información de empleados
- **Reportes y Estadísticas**: Ver análisis y reportes

### 3. Registrar Horas

1. Selecciona un empleado
2. Ingresa la fecha
3. Completa las horas para cada tipo
4. Haz clic en "Registrar Horas"

### 4. Gestionar Empleados

1. Haz clic en "Nuevo Empleado"
2. Completa la información requerida
3. Guarda el empleado

## Características Técnicas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Almacenamiento**: LocalStorage (modo offline) / Firebase (modo online)
- **Diseño**: Responsive y moderno
- **Colores**: Paleta azul y blanco de AXYRA
- **Iconos**: Font Awesome 6.4.0

## Archivos Principales

- `gestion_personal.html` - Página principal
- `gestion_personal.js` - Lógica de la aplicación
- `gestion_personal-styles.css` - Estilos específicos
- `datos-ejemplo.js` - Datos de prueba

## Dependencias

- Firebase SDK (opcional)
- Sistema de notificaciones AXYRA
- Calculadora de ley laboral colombiana
- Generador de PDF

## Solución de Problemas

### Error: "Firebase SDK no está disponible"

- Es normal en modo offline
- La aplicación funciona con LocalStorage

### Error: "jsPDF no está disponible"

- Se usa generación HTML como alternativa
- Funcionalidad básica no afectada

### Páginas en blanco

- Verificar que todos los archivos JS estén cargados
- Revisar la consola del navegador para errores
- Usar "Cargar Datos de Ejemplo" para inicializar

## Soporte

Para problemas técnicos, revisar:

1. Consola del navegador (F12)
2. Archivos de log en la consola
3. Estado de las dependencias

## Versión

1.0.0 - Sistema unificado de gestión de personal


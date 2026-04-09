# AXYRA Nómina V2

Sistema completo de gestión y cálculo de nómina colombiana con arquitectura multi-tenant (SaaS).

## Características Principales

- **Multi-empresa**: Arquitectura completamente aislada por empresa
- **Gestión de empleados**: Control completo de empleados activos e inactivos
- **Tipos de hora configurables**: 10 tipos predefinidos con recargos personalizables
- **Registro de horas**: Sistema quincenal de registro de horas trabajadas
- **Cálculo automático de nómina**: Con devengados, deducciones y neto a pagar
- **Configuración flexible**: Parámetros configurables por empresa sin modificar código
- **Roles de usuario**: Admin, Operador y Consulta
- **Seguridad**: Row Level Security (RLS) y autenticación con Supabase

## Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React

## Estructura de la Base de Datos

### Tablas principales:

1. **companies** - Empresas clientes del sistema
2. **profiles** - Perfiles de usuario
3. **company_users** - Relación usuarios-empresas con roles
4. **employees** - Empleados por empresa
5. **hour_types** - Tipos de hora configurables
6. **hour_records** - Registro de horas trabajadas
7. **payrolls** - Nóminas calculadas y guardadas
8. **company_settings** - Configuración por empresa

## Configuración

1. **Variables de entorno** (`.env`):
   ```
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar migraciones**: Las migraciones ya están aplicadas en Supabase

4. **Iniciar desarrollo**:
   ```bash
   npm run dev
   ```

5. **Construir para producción**:
   ```bash
   npm run build
   ```

## Uso del Sistema

### 1. Registro e Inicio de Sesión
- Crear cuenta nueva o iniciar sesión con cuenta existente
- El sistema crea automáticamente un perfil de usuario

### 2. Crear una Empresa
- Ir a "Empresas" (solo admin)
- Llenar datos legales: razón social, NIT, dirección, etc.
- Al crear una empresa se generan automáticamente:
  - 10 tipos de hora predefinidos
  - Configuración inicial con valores por defecto

### 3. Gestionar Empleados
- Agregar empleados con datos básicos
- Definir tipo de contrato (FIJO/TEMPORAL)
- Establecer salario mensual
- Activar/desactivar empleados

### 4. Configurar Tipos de Hora
- Revisar o modificar los 10 tipos predefinidos
- Agregar nuevos tipos personalizados
- Ajustar porcentajes de recargo

### 5. Registrar Horas
- Seleccionar empleado y quincena (formato: YYYY-MM-Q1 o YYYY-MM-Q2)
- Elegir tipo de hora
- Ingresar cantidad de horas
- Opcionalmente agregar deudas

### 6. Calcular Nómina
- Seleccionar quincena y empleados
- El sistema calcula automáticamente:
  - Valor hora base
  - Devengado por cada tipo de hora
  - Auxilio de transporte (si aplica)
  - Deducciones (salud, pensión, deudas)
  - Neto a pagar
- Guardar nómina para histórico

### 7. Configuración de Empresa
- Ajustar salario mínimo vigente
- Modificar auxilio de transporte
- Cambiar porcentajes de salud y pensión
- Configurar horas base mensuales

## Fórmulas de Cálculo

```
Valor hora base = Salario mensual / Horas base (220)

Pago por tipo = Valor hora × (1 + porcentaje/100) × horas trabajadas

Total devengado = Suma de todos los pagos

Auxilio transporte = Aplica si salario ≤ 2 × salario mínimo

Deducción salud = Devengado × (% salud / 100)
Deducción pensión = Devengado × (% pensión / 100)

Neto a pagar = Devengado + Auxilio - Deducciones
```

## Roles y Permisos

- **Admin**: Acceso completo, puede gestionar todo
- **Operator**: Puede gestionar empleados, horas y calcular nómina
- **Viewer**: Solo lectura de información

## Seguridad

- Row Level Security (RLS) activado en todas las tablas
- Cada empresa solo accede a sus propios datos
- Políticas estrictas de acceso por rol
- Contraseñas cifradas con Supabase Auth
- Validación de cédula única por empresa

## Tipos de Hora Predefinidos

1. Ordinaria (0%)
2. Recargo nocturno (35%)
3. Recargo diurno dominical (75%)
4. Recargo nocturno dominical (110%)
5. Hora extra diurna (25%)
6. Hora extra nocturna (75%)
7. Hora diurna dominical/festivo (80%)
8. Hora extra diurna dominical/festivo (105%)
9. Hora nocturna dominical/festivo (110%)
10. Hora extra nocturna dominical/festivo (185%)

## Soporte

Para soporte técnico o consultas, contactar a Villa Venecia.

## Licencia

Propiedad de Villa Venecia - Todos los derechos reservados

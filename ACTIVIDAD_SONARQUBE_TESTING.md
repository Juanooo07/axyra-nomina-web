# Actividad: SonarQube y Pruebas Unitarias

## 🎯 Objetivos de la Actividad

1. **Instalar y aprender SonarQube**
2. **Seleccionar código para evaluación** (Proyecto Axyra refactorizado)
3. **Identificar métricas de calidad del código**
4. **Implementar pruebas unitarias con mínimo 30% de cobertura**

## 📋 Estado Actual del Proyecto

### ✅ Completado - Phase 1.3: Eliminación de Duplicación de Código
- ✅ **Tipos compartidos creados** (`src/components/Payroll/types.ts`)
- ✅ **Utilidades comunes extraídas** (`src/components/Payroll/utils.ts`)
- ✅ **Hook personalizado creado** (`useEmployeeSelection`)
- ✅ **Interfaces duplicadas eliminadas** de todos los componentes
- ✅ **Funciones de formateo centralizadas**

### 🔧 Configuración de Testing
- ✅ **Vitest configurado** con React Testing Library
- ✅ **Tests unitarios creados** para utilidades y componentes
- ✅ **Cobertura configurada** con umbrales del 30%
- ✅ **Mocks implementados** para Supabase y AuthContext

## 🚀 Próximos Pasos

### 1. Instalación de SonarQube

#### Opción A: Docker (Recomendado)
```bash
# Instalar Docker Desktop
# Luego ejecutar:
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```

#### Opción B: Instalación Manual
1. Descargar SonarQube Community Edition desde: https://www.sonarsource.com/products/sonarqube/downloads/
2. Extraer el archivo ZIP
3. Ejecutar `bin/windows-x86-64/StartSonar.bat`
4. Acceder a http://localhost:9000 (admin/admin)

### 2. Configuración del Proyecto en SonarQube

1. **Crear proyecto** en SonarQube con la clave: `axyra-nomina-web`
2. **Configurar análisis** usando el archivo `sonar-project.properties` existente
3. **Generar token de autenticación**

### 3. Análisis de Calidad del Código

#### Métricas Principales a Identificar:
- **Code Smells**: Problemas de mantenibilidad
- **Bugs**: Errores potenciales
- **Vulnerabilities**: Problemas de seguridad
- **Coverage**: Cobertura de pruebas
- **Duplications**: Código duplicado
- **Technical Debt**: Deuda técnica

#### Comandos para Análisis:
```bash
# Instalar sonar-scanner
npm install -g sonarsource-sonar-scanner

# Ejecutar análisis
npm run sonar
```

### 4. Pruebas Unitarias

#### Ejecutar Tests:
```bash
# Ejecutar todos los tests
npm run test

# Ejecutar con UI
npm run test:ui

# Ejecutar con cobertura
npm run test:coverage
```

#### Tests Implementados:
- ✅ `utils.test.ts` - Utilidades de formateo y fechas
- ✅ `useEmployeeSelection.test.tsx` - Hook personalizado
- ✅ `PayrollSummary.test.tsx` - Componente de resumen

#### Objetivo de Cobertura: **30% mínimo**
- Lines: 30%
- Functions: 30%
- Branches: 30%
- Statements: 30%

## 📊 Métricas de Calidad Esperadas

### Después del Análisis con SonarQube:
- **Reliability**: B bugs encontrados
- **Security**: A vulnerabilities
- **Maintainability**: A/B rating
- **Coverage**: >30%
- **Duplications**: <5%

### Mejoras Implementadas:
- ✅ Componentes refactorizados (4 componentes en lugar de 1 monolítico)
- ✅ Tipos TypeScript centralizados
- ✅ Código duplicado eliminado
- ✅ Tests unitarios implementados
- ✅ Configuración de CI/CD preparada

## 🎯 Resultados Esperados

1. **SonarQube instalado y configurado**
2. **Proyecto Axyra analizado completamente**
3. **Métricas de calidad identificadas y documentadas**
4. **Cobertura de pruebas >= 30%**
5. **Informe de calidad del código generado**

## 📝 Documentación Requerida

Crear un informe que incluya:
- Configuración de SonarQube
- Métricas obtenidas
- Problemas identificados
- Cobertura de pruebas lograda
- Recomendaciones de mejora

---

**Proyecto**: Axyra Sistema de Gestión de Nómina
**Fecha**: Abril 2026
**Estado**: Phase 1.3 completada, listo para análisis con SonarQube
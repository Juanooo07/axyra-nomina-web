# 🚀 Despliegue de Reglas e Índices de Firebase

Este documento explica cómo desplegar las reglas de seguridad e índices de Firebase para el sistema AXYRA.

## 📋 Archivos Incluidos

### Reglas de Firestore (`firestore.rules`)
- **Usuarios**: Control de acceso por roles y empresa
- **Empleados**: Gestión por empresa y roles
- **Nóminas**: Acceso por empleado y roles financieros
- **Inventario**: Gestión por empresa y roles de almacén
- **Membresías**: Control de acceso por usuario y empresa
- **Pagos**: Seguridad de transacciones por usuario
- **Transacciones Wompi**: Control de transacciones de pago
- **Reportes**: Acceso por empresa y roles
- **Auditoría**: Solo lectura para admins

### Reglas de Storage (`storage.rules`)
- **Usuarios**: Archivos personales por usuario
- **Empresa**: Documentos corporativos por admin
- **Nóminas**: Documentos de nómina por empresa
- **Reportes**: Archivos de reporte por usuario
- **Avatares**: Imágenes de perfil por usuario
- **Empleados**: Documentos de empleados por empresa
- **Sistema**: Archivos del sistema por admin
- **Temporales**: Archivos temporales por usuario

### Índices de Firestore (`firestore.indexes.json`)
- **Empleados**: Por empresa, estado, cargo, fecha
- **Horas**: Por empleado, período, fecha
- **Nóminas**: Por período, empleado, fecha
- **Cuadre de Caja**: Por fecha, tipo, concepto
- **Inventario**: Por empresa, categoría, stock
- **Facturas**: Por fecha, estado, cliente
- **Membresías**: Por usuario, plan, estado, fechas
- **Pagos**: Por usuario, estado, plan, método, fecha
- **Usuarios**: Por rol, empresa, membresía, plan
- **Notificaciones**: Por usuario, estado, fecha
- **Reportes**: Por empresa, tipo, fecha
- **Auditoría**: Por usuario, acción, fecha

## 🛠️ Comandos de Despliegue

### Opción 1: Script Automático (Recomendado)

#### Windows (PowerShell):
```powershell
.\scripts\deploy-firebase-rules.ps1
```

#### Linux/Mac (Node.js):
```bash
node scripts/deploy-firebase-rules.js
```

### Opción 2: Comandos Manuales

```bash
# Desplegar reglas de Firestore
firebase deploy --only firestore:rules

# Desplegar índices de Firestore
firebase deploy --only firestore:indexes

# Desplegar reglas de Storage
firebase deploy --only storage

# Desplegar todo junto
firebase deploy --only firestore,storage
```

## ⚠️ Requisitos Previos

1. **Firebase CLI instalado**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Autenticado en Firebase**:
   ```bash
   firebase login
   ```

3. **Proyecto configurado**:
   ```bash
   firebase use --add
   ```

## 🔍 Verificación Post-Despliegue

1. **Consola de Firebase**:
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto
   - Verifica en "Firestore Database" > "Reglas"
   - Verifica en "Storage" > "Reglas"
   - Verifica en "Firestore Database" > "Índices"

2. **Pruebas de Seguridad**:
   - Intenta acceder a datos sin autenticación
   - Verifica que los usuarios solo accedan a sus datos
   - Confirma que los admins tengan acceso completo

## 🚨 Consideraciones de Seguridad

### Reglas de Firestore
- ✅ Usuarios solo acceden a sus propios datos
- ✅ Empleados filtrados por empresa
- ✅ Nóminas protegidas por roles financieros
- ✅ Membresías controladas por usuario
- ✅ Pagos seguros por usuario
- ✅ Auditoría solo lectura para admins

### Reglas de Storage
- ✅ Archivos personales por usuario
- ✅ Documentos corporativos por admin
- ✅ Validación de tipos de archivo
- ✅ Límites de tamaño por tipo
- ✅ Acceso temporal para archivos temp

## 📊 Monitoreo

### Logs de Seguridad
- Revisa los logs de Firebase para intentos de acceso no autorizados
- Monitorea el uso de Storage para detectar abusos
- Verifica el rendimiento de las consultas con los nuevos índices

### Métricas Importantes
- Tiempo de respuesta de consultas
- Errores de permisos
- Uso de Storage por usuario
- Frecuencia de acceso a datos sensibles

## 🔄 Actualizaciones Futuras

Cuando modifiques las reglas o índices:

1. **Desarrollo Local**:
   ```bash
   firebase emulators:start
   ```

2. **Pruebas**:
   - Usa el emulador para probar cambios
   - Verifica que las reglas funcionen correctamente

3. **Despliegue**:
   - Ejecuta el script de despliegue
   - Verifica en la consola de Firebase

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de Firebase
2. Verifica la sintaxis de las reglas
3. Confirma que los índices estén desplegados
4. Contacta al equipo de desarrollo

---

**¡Importante!** Siempre prueba las reglas en el emulador antes de desplegar a producción.

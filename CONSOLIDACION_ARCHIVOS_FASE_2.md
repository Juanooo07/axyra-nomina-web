# 🧹 PLAN DE CONSOLIDACIÓN Y LIMPIEZA

## 📋 ARCHIVOS A CONSOLIDAR

### 💳 PAGOS - Mantener 1, Eliminar 7

**MANTENER (Consolidar aquí):**
- ✅ `frontend/static/payment-system-unified.js` (versión más completa)

**ELIMINAR (Duplicados):**
- ❌ `frontend/static/wompi-only-payment.js`
- ❌ `frontend/static/payment-verification.js`
- ❌ `frontend/static/payment-system.js`
- ❌ `frontend/static/payment-redirect.js`
- ❌ `frontend/static/payment-module.js`
- ❌ `frontend/static/payment-handler.js` (ya consolidado en backend)
- ❌ `frontend/static/payment-email-system.js`

### 🔔 NOTIFICACIONES - Mantener 1, Eliminar 7

**MANTENER (Ya existe consolidado):**
- ✅ `frontend/js/axyra-notifications.js` (el oficial)

**ELIMINAR (Duplicados obsoletos):**
- ❌ `frontend/static/notifications.js`
- ❌ `frontend/static/notifications-system-improved.js`
- ❌ `frontend/static/notifications-system-professional.js`
- ❌ `frontend/static/professional-notifications.js`
- ❌ `frontend/static/advanced-notifications.js`
- ❌ `frontend/static/gmail-notifications.js`
- ❌ `frontend/static/welcome-notification.js`
- ❌ `frontend/static/push-notifications-system.js`

### 💾 BACKUP - Mantener 1, Eliminar 2

**MANTENER:**
- ✅ `scripts/backup-system.js` (versión consolidada)

**ELIMINAR:**
Buscar variantes como backup-system-advanced.js, backup-system-unified.js

---

## ✅ PRÓXIMOS CAMBIOS

1. Generar script para eliminar archivos
2. Actualizar imports en HTML que referencien estos archivos
3. Verificar que todo funciona sin los duplicados

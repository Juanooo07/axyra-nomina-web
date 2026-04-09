# 🔑 Configuración de Wompi para AXYRA

## 📋 Pasos para configurar Wompi correctamente

### 1. **Obtener claves de Wompi**

1. Ve a [Wompi Dashboard](https://dashboard.wompi.co/)
2. Inicia sesión en tu cuenta
3. Ve a **"Configuración"** → **"Claves"**
4. Copia tu **Clave Pública** y **Clave Privada**

### 2. **Configurar claves en el código**

Edita el archivo `frontend/static/wompi-keys-config.js`:

```javascript
this.config = {
  // REEMPLAZAR CON TUS CLAVES REALES
  publicKey: 'pub_test_tu_clave_publica_aqui',
  privateKey: 'prv_test_tu_clave_privada_aqui',

  // Configuración de entorno
  environment: 'test', // 'test' o 'production'

  // ... resto de la configuración
};
```

### 3. **Configurar variables de entorno en Vercel**

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **"Settings"** → **"Environment Variables"**
3. Agrega las siguientes variables:

```
WOMPI_PUBLIC_KEY=pub_test_tu_clave_publica
WOMPI_PRIVATE_KEY=prv_test_tu_clave_privada
WOMPI_ENVIRONMENT=test
```

### 4. **Configuración para validación de $200 COP**

El sistema está configurado para:

- **Validación de identidad:** $200 COP
- **Prueba gratuita:** 7 días
- **Redirección:** Automática después del pago

### 5. **URLs de redirección**

Configura en tu dashboard de Wompi:

- **URL de éxito:** `https://tu-dominio.vercel.app/modulos/membresias/membresias.html?validation=success&plan={plan}`
- **URL de error:** `https://tu-dominio.vercel.app/modulos/membresias/membresias.html?validation=error`

### 6. **Probar el sistema**

1. Ve a la página de membresías
2. Selecciona un plan
3. Haz clic en "Comenzar Prueba Gratis"
4. Deberías ver el modal de validación de $200 COP
5. Haz clic en "Validar Identidad - $200 COP"
6. Te redirigirá a Wompi con el monto correcto

### 7. **Verificar funcionamiento**

- ✅ Modal muestra $200 COP
- ✅ Redirección a Wompi con monto correcto
- ✅ Retorno exitoso activa prueba gratuita
- ✅ Notificación de éxito

## 🔧 Solución de problemas

### **Problema: Sigue cobrando $99,000**

**Solución:** Verifica que las claves estén configuradas correctamente y que el archivo `wompi-keys-config.js` esté cargado.

### **Problema: No redirige a Wompi**

**Solución:** Verifica que la URL de Wompi esté configurada correctamente y que las claves sean válidas.

### **Problema: No activa la prueba gratuita**

**Solución:** Verifica que la URL de redirección esté configurada correctamente en Wompi.

## 📞 Soporte

Si tienes problemas con la configuración, contacta al soporte técnico de AXYRA.


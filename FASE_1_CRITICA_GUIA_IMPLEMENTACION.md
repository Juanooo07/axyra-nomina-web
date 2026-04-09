# 🔴 FASE 1 - CORRECCIONES CRÍTICAS (2-3 horas)

## Estado: LISTA PARA IMPLEMENTAR AHORA

---

## 1️⃣ REMOVER CLAVES SECRETAS DEL FRONTEND

### 🔴 CRÍTICO: Las claves NUNCA deben estar en JavaScript visible

### Paso 1: Identificar y Remover Claves Expuestas

#### Archivo 1: `frontend/static/payment-handler.js` (línea 11)

**ANTES (❌ INSEGURO):**
```javascript
// Línea 11
const WOMPI_CONFIG = {
  publicKey: 'pub_prod_DMd1RNFhiA3813HZ3YZFsNjSg2beSS00',
  privateKey: 'prv_prod_aka7VAtItpCAF3qhVuD8zvt7FUWXduPY', // ❌ EXPUESTO
  baseUrl: 'https://production.wompi.co/v1',
};
```

**DESPUÉS (✅ SEGURO):**
```javascript
// Línea 11 - Obtener del servidor (nunca del frontend)
const WOMPI_CONFIG = {
  publicKey: 'pub_prod_DMd1RNFhiA3813HZ3YZFsNjSg2beSS00', // Solo la pública (ok)
  // ❌ privateKey REMOVIDO - nunca en frontend
  baseUrl: 'https://axyra-sistema-gestion-main.vercel.app/api', // API tu propia
};
```

#### Archivo 2: `frontend/static/wompi-integration.js` (línea 11)

Aplicar mismo cambio

#### Archivo 3: `frontend/js/axyra-payment-integration.js`

Buscar y remover todas las instancias de `privateKey`

### Paso 2: Crear Backend Service Seguro

Crear nuevo archivo: `api/services/wompi-service.js`

```javascript
/**
 * 🔒 SERVICIO SEGURO DE WOMPI - Backend Only
 * Las claves privadas NUNCA salen del servidor
 */

const fetch = require('node-fetch');
const crypto = require('crypto');

class WompiService {
  constructor() {
    this.publicKey = process.env.WOMPI_PUBLIC_KEY; // Pública (ok en env)
    this.privateKey = process.env.WOMPI_PRIVATE_KEY; // ❌ NUNCA exponerlo
    this.merchantId = process.env.WOMPI_MERCHANT_ID;
    this.baseUrl = 'https://production.wompi.co/v1';
  }

  /**
   * Procesar pago de forma segura (solo servidor)
   * Frontend NO ve las claves
   */
  async processPayment(transactionId, amount) {
    try {
      // Las claves se usan AQUÍ, en el servidor
      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.privateKey}`, // ✅ Seguro
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Wompi error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error procesando pago:', error.message);
      throw error;
    }
  }

  /**
   * Verificar firma del webhook (solo servidor)
   */
  verifyWebhookSignature(payload, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', this.privateKey) // ✅ Seguro en servidor
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * IMPORTANTE: Nunca exposer getConfig() al frontend
   */
  // ❌ getConfig() NO es público - NO exponer al cliente
}

module.exports = new WompiService();
```

### Paso 3: Crear Endpoint Backend Seguro

Crear: `api/secure-payment-process.js`

```javascript
/**
 * Endpoint SEGURO para procesar pagos
 * Frontend solo envía ID de transacción
 */

const wompiService = require('./services/wompi-service');
const admin = require('firebase-admin');

module.exports = async (req, res) => {
  // ✅ CORS RESTRINGIDO (ver sección 2)
  res.setHeader('Access-Control-Allow-Origin', 'https://axyra.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación del usuario
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // El frontend SOLO envía la transactionId
    // Las claves se usan AQUÍ, en el servidor (seguro)
    const { transactionId } = req.body;

    // Procesar usando servicio seguro
    const result = await wompiService.processPayment(transactionId);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error procesando pago'
    });
  }
};
```

### Paso 4: Actualizar Frontend para Usar Backend

**ANTES (❌ Usa claves locales):**
```javascript
// ❌ No hacer esto
const wompiConfig = {
  privateKey: 'prv_prod_...' // ❌ EXPUESTO
};
const response = await directWompiAPI(transactionId, wompiConfig);
```

**DESPUÉS (✅ Usa endpoint backend):**
```javascript
// ✅ Hacer esto
async function verifyPayment(transactionId) {
  const response = await fetch('/api/secure-payment-process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}` // Token del usuario
    },
    body: JSON.stringify({ transactionId })
  });

  return await response.json();
}
```

---

## 2️⃣ REPARAR CORS ABIERTO (Whitelist de Dominios)

### 🚫 Problema Actual
```javascript
// ❌ INSEGURO - Aceptas peticiones de CUALQUIER dominio
res.setHeader('Access-Control-Allow-Origin', '*');
```

### ✅ Solución: Whitelist

#### Paso 1: Crear Función de CORS Seguro

Nuevo archivo: `api/middleware/secure-cors.js`

```javascript
/**
 * 🔒 Middleware de CORS Seguro
 * Solo permite dominios de confianza
 */

const ALLOWED_ORIGINS = [
  'https://axyra.vercel.app',
  'https://axyra-sistema-gestion.vercel.app',
  'https://axyra.replit.dev', // Si estás en Replit
  'http://localhost:3000', // Solo desarrollo local
];

function secureCors(req, res) {
  const origin = req.headers.origin;

  // ✅ Solo permitir orígenes en whitelist
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // ❌ Rechazar otros orígenes (sin header CORS)
    console.warn(`CORS bloqueado: origen no permitido: ${origin}`);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
}

module.exports = secureCors;
```

#### Paso 2: Aplicar a Todos los Endpoints de Pago

**Actualizar: `api/process-wompi-payment.js`**

```javascript
// Antes (línea 22 y 203):
res.setHeader('Access-Control-Allow-Origin', '*'); // ❌

// Después:
const secureCors = require('./middleware/secure-cors');
secureCors(req, res); // ✅
```

**Archivos a Actualizar:**
- [ ] `api/process-wompi-payment.js` (líneas 22, 203)
- [ ] `api/paypal-payment.js` (línea 122)
- [ ] `api/paypal-webhook.js`
- [ ] `api/wompi-webhook.js` (línea 16)
- [ ] `api/check-user-plan.js` (línea 17)
- [ ] `api/index.js` (si tiene endpoints de pago)

### Paso 3: Testear CORS

```bash
# Test desde origin no permitido
curl -H "Origin: https://malicious-site.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS https://axyra.vercel.app/api/process-wompi-payment

# Resultado esperado: NO hay header de CORS ✅
# Si aparece "Access-Control-Allow-Origin" → FALLO ❌
```

---

## 3️⃣ IMPLEMENTAR RATE LIMITING

### Paso 1: Instalar Librería

```bash
npm install express-rate-limit
npm install redis redis-rate-limit # Para rate limit distribuido
```

### Paso 2: Crear Middleware de Rate Limit

Archivo: `api/middleware/rate-limit.js`

```javascript
/**
 * 🛡️ Rate Limiting para proteger APIs
 * Previene:
 * - Brute force
 * - DDoS
 * - API abuse
 */

const rateLimit = require('express-rate-limit');

// Rate limiter para APIs de pago (ESTRICTO)
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos por IP
  message: 'Demasiados intentos de pago. Intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  // Usar Redis para rate limit distribuido en producción
  // store: new RedisStore({...})
});

// Rate limiter para APIs generales (MODERADO)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests
  message: 'Demasiadas solicitudes. Intenta más tarde.'
});

// Rate limiter para login (ESTRICTO)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos fallidos
  message: 'Demasiados intentos de login. Intenta más tarde.',
  skipSuccessfulRequests: true // No contar intentos exitosos
});

module.exports = {
  paymentLimiter,
  apiLimiter,
  loginLimiter
};
```

### Paso 3: Aplicar a Endpoints Críticos

**Actualizar: `api/process-wompi-payment.js`**

```javascript
const { paymentLimiter } = require('./middleware/rate-limit');

module.exports = async (req, res) => {
  // ✅ Aplicar rate limiting PRIMERO
  paymentLimiter(req, res, () => {
    // Resto del código...
    // Ahora está protegido contra abuse
  });
};
```

**Aplicar a estos endpoints:**
- [ ] `api/process-wompi-payment.js`
- [ ] `api/paypal-payment.js`
- [ ] `api/check-user-plan.js`
- [ ] `api/index.js` - endpoints críticos

### Paso 4: Monitoreo

Agregar logging:

```javascript
// En rate-limit middleware
paymentLimiter.skip = (req, res) => {
  // Log cuando se alcanza limit
  if (req.rateLimit.current > req.rateLimit.limit) {
    console.warn(`⚠️ Rate limit excedido: ${req.ip}`);
    // Alertar a admin si es necesario
  }
  return false; // No skip
};
```

---

# 📋 CHECKLIST - FASE 1 CRÍTICA

## ANTES DE DEPLOYER

- [ ] **Claves removidas**
  - [ ] `payment-handler.js` actualizado
  - [ ] `wompi-integration.js` actualizado  
  - [ ] `axyra-payment-integration.js` actualizado
  - [ ] Backend service creado y probado

- [ ] **CORS Reparado**
  - [ ] Middleware de CORS seguro creado
  - [ ] Aplicado a `process-wompi-payment.js`
  - [ ] Aplicado a `paypal-payment.js`
  - [ ] Aplicado a `wompi-webhook.js`
  - [ ] Testeo manual completado

- [ ] **Rate Limiting Implementado**
  - [ ] Librería instalada
  - [ ] Middleware creado
  - [ ] Aplicado a endpoints de pago
  - [ ] Testeo de limits funcionando

## TESTING REQUERIDO

```bash
# Test 1: Verificar que claves NO están en frontend
grep -r "prv_prod" frontend/
# Resultado esperado: NO encontrar nada ✅

# Test 2: Verificar CORS
curl -H "Origin: https://attacker.com" \
  https://tu-api.com/api/process-wompi
# Resultado: Sin header CORS ✅

# Test 3: Verificar Rate Limit
for i in {1..10}; do
  curl https://tu-api.com/api/process-wompi
done
# Resultado: Después del 5to intento → error 429 ✅
```

## DEPLOYMENT

1. [ ] Hacer backup del proyecto antes
2. [ ] Deployar cambios a staging primero
3. [ ] Ejecutar tests de seguridad
4. [ ] Deployar a producción

---

# 🚨 ADVERTENCIA IMPORTANTE

**Si no haces esto hoy:**
- ❌ Tu cuenta de Wompi/PayPal puede ser comprometida
- ❌ Transacciones fraudulentas usando tus claves
- ❌ Pérdida financiera (potencialmente total)
- ❌ Responsabilidad legal

**Esto DEBE hacer AHORA, no después.**

---

# ✅ PRÓXIMO PASO

Una vez completada la Fase 1, prosegue con:
- **Fase 2:** Consolidar archivos duplicados
- **Fase 3:** Limpiar console.log y deuda técnica

¿Listo para comenzar?

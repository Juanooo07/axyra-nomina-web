# 🔧 Documentación Técnica - AXYRA

## 📋 Índice

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Configuración de Desarrollo](#configuración-de-desarrollo)
3. [API Reference](#api-reference)
4. [Integraciones](#integraciones)
5. [Seguridad](#seguridad)
6. [Performance](#performance)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

```
Frontend:
├── HTML5 + CSS3 + JavaScript ES6+
├── Firebase SDK 9.22.0
├── Chart.js para visualizaciones
├── Service Workers para PWA
└── IndexedDB para almacenamiento local

Backend:
├── Firebase Authentication
├── Firestore Database
├── Firebase Storage
├── Firebase Functions (Node.js)
└── Express.js API

Infraestructura:
├── Vercel (Hosting)
├── Firebase (Backend)
├── CDN (Cloudflare)
└── SSL/TLS (Let's Encrypt)
```

### Estructura de Archivos

```
axyra-sistema-gestion/
├── frontend/
│   ├── js/
│   │   ├── axyra-config.js          # Configuración central
│   │   ├── axyra-auth.js           # Sistema de autenticación
│   │   ├── axyra-notifications.js  # Sistema de notificaciones
│   │   ├── axyra-realtime.js       # Comunicación en tiempo real
│   │   ├── axyra-*.js              # Módulos especializados
│   │   └── axyra-testing-suite.js  # Suite de testing
│   ├── docs/                       # Documentación
│   ├── modulos/                    # Módulos de la aplicación
│   └── static/                     # Archivos estáticos
├── api/                           # API Backend
├── config/                        # Configuraciones
└── docs/                          # Documentación general
```

## ⚙️ Configuración de Desarrollo

### Requisitos del Sistema

- **Node.js**: 16.x o superior
- **npm**: 8.x o superior
- **Git**: 2.x o superior
- **Navegador**: Chrome 90+, Firefox 88+, Safari 14+

### Variables de Entorno

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Workspace
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Microsoft 365
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id
VITE_MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
VITE_MICROSOFT_TENANT_ID=your_tenant_id
VITE_MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/microsoft/callback

# Payment Gateways
VITE_WOMPI_PUBLIC_KEY=your_wompi_public_key
VITE_WOMPI_PRIVATE_KEY=your_wompi_private_key
VITE_WOMPI_ENVIRONMENT=sandbox

# Email Services
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your_email@gmail.com
VITE_SMTP_PASSWORD=your_app_password
```

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/your-org/axyra-sistema-gestion.git
cd axyra-sistema-gestion

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar tests
npm run test

# Build para producción
npm run build
```

## 🔌 API Reference

### Autenticación

#### Login

```javascript
// Método: POST
// Endpoint: /api/auth/login
// Body: { email, password }

const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

#### Logout

```javascript
// Método: POST
// Endpoint: /api/auth/logout

const response = await fetch('/api/auth/logout', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
});
```

### Empleados

#### Obtener Empleados

```javascript
// Método: GET
// Endpoint: /api/employees
// Query: ?page=1&limit=10&search=nombre

const response = await fetch('/api/employees?page=1&limit=10');
const data = await response.json();
```

#### Crear Empleado

```javascript
// Método: POST
// Endpoint: /api/employees
// Body: { name, document, position, salary, ... }

const employee = {
  name: 'Juan Pérez',
  document: '12345678',
  position: 'Desarrollador',
  salary: 3000000,
};

const response = await fetch('/api/employees', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(employee),
});
```

### Inventario

#### Obtener Productos

```javascript
// Método: GET
// Endpoint: /api/inventory
// Query: ?category=electronics&stock=low

const response = await fetch('/api/inventory?category=electronics');
```

#### Actualizar Stock

```javascript
// Método: PUT
// Endpoint: /api/inventory/:id/stock
// Body: { quantity, operation: 'add|subtract' }

const response = await fetch(`/api/inventory/${productId}/stock`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ quantity: 10, operation: 'add' }),
});
```

### Reportes

#### Generar Reporte

```javascript
// Método: POST
// Endpoint: /api/reports/generate
// Body: { type, filters, format }

const report = {
  type: 'payroll',
  filters: {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  },
  format: 'pdf',
};

const response = await fetch('/api/reports/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(report),
});
```

## 🔗 Integraciones

### Google Workspace

#### Configuración OAuth2

```javascript
const googleConfig = {
  clientId: process.env.VITE_GOOGLE_CLIENT_ID,
  clientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.VITE_GOOGLE_REDIRECT_URI,
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/calendar.events',
  ],
};
```

#### Uso de la API

```javascript
// Enviar email
await window.axyraGoogleWorkspace.sendEmail('destinatario@email.com', 'Asunto', 'Contenido del email');

// Crear evento
await window.axyraGoogleWorkspace.createEvent({
  title: 'Reunión',
  startTime: '2024-01-15T10:00:00',
  endTime: '2024-01-15T11:00:00',
  attendees: ['usuario@email.com'],
});
```

### Microsoft 365

#### Configuración

```javascript
const microsoftConfig = {
  clientId: process.env.VITE_MICROSOFT_CLIENT_ID,
  clientSecret: process.env.VITE_MICROSOFT_CLIENT_SECRET,
  tenantId: process.env.VITE_MICROSOFT_TENANT_ID,
  redirectUri: process.env.VITE_MICROSOFT_REDIRECT_URI,
};
```

#### Uso de la API

```javascript
// Crear reunión Teams
await window.axyraMicrosoft365.createMeeting({
  title: 'Reunión Teams',
  startTime: '2024-01-15T14:00:00',
  endTime: '2024-01-15T15:00:00',
  attendees: ['usuario@empresa.com'],
});
```

## 🔒 Seguridad

### Autenticación

#### JWT Tokens

```javascript
// Estructura del token
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id",
    "iat": 1640995200,
    "exp": 1641081600,
    "role": "admin"
  }
}
```

#### 2FA Implementation

```javascript
// Generar código TOTP
const totp = new TOTP({
  secret: userSecret,
  digits: 6,
  period: 30,
});

const code = totp.generate();
```

### Encriptación

#### AES-GCM

```javascript
// Encriptar datos sensibles
const encrypted = await window.axyraEncryption.encrypt(sensitiveData, encryptionKey);

// Desencriptar
const decrypted = await window.axyraEncryption.decrypt(encrypted, encryptionKey);
```

### Validación de Entrada

```javascript
// Sanitizar HTML
const sanitized = window.axyraSecurity.sanitizeHTML(userInput);

// Validar email
const isValidEmail = window.axyraSecurity.validateEmail(email);

// Validar documento
const isValidDocument = window.axyraSecurity.validateDocument(document);
```

## ⚡ Performance

### Optimizaciones Implementadas

#### Lazy Loading

```javascript
// Cargar módulos bajo demanda
const module = await window.axyraLazyLoading.loadModule('inventory');

// Preload de recursos críticos
window.axyraLazyLoading.preload(['dashboard', 'charts']);
```

#### Caching

```javascript
// Cache en memoria
const cached = await window.axyraCache.get('employees');
if (!cached) {
  const data = await fetchEmployees();
  await window.axyraCache.set('employees', data, 300000); // 5 min
}
```

#### Compression

```javascript
// Comprimir recursos
await window.axyraCompression.compressResource('large-data.json');

// Descomprimir
const data = await window.axyraCompression.decompress(compressedData);
```

### Métricas de Performance

```javascript
// Core Web Vitals
const vitals = await window.axyraAnalytics.getCoreWebVitals();

// Métricas personalizadas
const metrics = {
  loadTime: performance.now(),
  memoryUsage: performance.memory?.usedJSHeapSize,
  networkRequests: performance.getEntriesByType('resource').length,
};
```

## 🧪 Testing

### Suite de Testing

```javascript
// Ejecutar todos los tests
await window.axyraTestingSuite.runAllTests();

// Ejecutar test específico
await window.axyraTestingSuite.runTest('auth-login');

// Obtener reporte
const report = window.axyraTestingSuite.getTestReport();
```

### Tests Unitarios

```javascript
// Test de autenticación
async function testAuthLogin() {
  const result = await window.axyraAuth.login('test@email.com', 'password');
  assert(result.success, 'Login should succeed');
}

// Test de configuración
async function testConfigLoad() {
  const config = window.axyraConfig.getAxyraConfig();
  assert(config.firebase, 'Firebase config should exist');
}
```

### Tests de Integración

```javascript
// Test de flujo completo
async function testEmployeeWorkflow() {
  // 1. Crear empleado
  const employee = await createEmployee(testData);

  // 2. Procesar nómina
  const payroll = await processPayroll(employee.id);

  // 3. Generar reporte
  const report = await generateReport('payroll');

  assert(report.success, 'Report should be generated');
}
```

## 🚀 Deployment

### Vercel Configuration

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

### Firebase Configuration

```javascript
// firebase.json
{
  "hosting": {
    "public": "frontend",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Environment Variables

```bash
# Production
VITE_FIREBASE_API_KEY=prod_api_key
VITE_FIREBASE_PROJECT_ID=prod_project_id
VITE_GOOGLE_CLIENT_ID=prod_google_client_id
# ... más variables
```

## 🔧 Troubleshooting

### Problemas Comunes

#### Error de Autenticación

```javascript
// Verificar configuración Firebase
console.log('Firebase Config:', window.axyraConfig.getAxyraConfig().firebase);

// Verificar tokens
const tokens = localStorage.getItem('axyra_auth_tokens');
console.log('Auth Tokens:', tokens);
```

#### Error de Conexión

```javascript
// Verificar estado de red
const isOnline = navigator.onLine;
console.log('Online Status:', isOnline);

// Verificar conectividad
const response = await fetch('/api/health');
console.log('API Status:', response.status);
```

#### Performance Issues

```javascript
// Analizar performance
const performanceData = {
  loadTime: performance.now(),
  memoryUsage: performance.memory,
  networkRequests: performance.getEntriesByType('resource'),
};

console.log('Performance Data:', performanceData);
```

### Logs y Debugging

```javascript
// Habilitar logs detallados
window.axyraConfig.updateAxyraConfig('system.debug', true);

// Ver logs en consola
console.log('Debug Mode:', window.axyraConfig.getAxyraConfig('system.debug'));
```

### Contacto de Soporte

- **Email**: dev@axyra.com
- **Slack**: #axyra-support
- **GitHub Issues**: https://github.com/axyra/issues
- **Documentación**: https://docs.axyra.com

---

**Última actualización**: Diciembre 2024  
**Versión**: 1.0.0  
**Mantenido por**: Equipo de Desarrollo AXYRA

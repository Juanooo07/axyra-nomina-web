# 📁 Estructura del Proyecto AXYRA

## 🏗️ **Organización General**

```
axyra-sistema-gestion/
├── 📁 frontend/                    # Aplicación web principal
│   ├── 📁 static/                 # Archivos estáticos (CSS, JS, imágenes)
│   ├── 📁 modulos/                # Módulos del sistema
│   ├── 📁 src/                    # Código fuente organizado
│   ├── 📄 index.html              # Página principal
│   ├── 📄 login.html              # Página de login
│   ├── 📄 register.html           # Página de registro
│   ├── 📄 manifest.json           # PWA manifest
│   ├── 📄 sw.js                   # Service Worker
│   ├── 🖼️ logo.png                # Logo de la aplicación
│   └── 🖼️ nomina.ico              # Favicon
├── 📁 backend/                     # API Backend (Python)
│   ├── 📄 main.py                 # Aplicación FastAPI
│   ├── 📄 requirements.txt        # Dependencias Python
│   ├── 📄 install.py              # Script de instalación
│   ├── 📄 README.md               # Documentación del backend
│   ├── 📁 google_drive.py         # Integración Google Drive
│   └── 📁 export_functions.py     # Funciones de exportación
├── 📁 docs/                        # Documentación del proyecto
│   ├── 📄 GUIA_DESPLIEGUE_COMPLETA.md
│   ├── 📄 PRUEBAS_FINALES.md
│   ├── 📄 vercel-env-setup.md
│   ├── 📄 vercel-env-variables.txt
│   └── 📄 ESTRUCTURA_PROYECTO.md
├── 📁 scripts/                     # Scripts de utilidad
│   ├── 📄 configurar-indices-firebase.js
│   ├── 📄 generar-indices-especificos.js
│   ├── 📄 deploy-complete.sh
│   └── 📄 deploy.sh
├── 📁 temp/                        # Archivos temporales
│   ├── 📄 env.production.example
│   └── 📄 config-vercel-env.bat
├── 📁 .github/                     # GitHub Actions
│   └── 📁 workflows/
│       └── 📄 deploy.yml
├── 📄 firebase.json                # Configuración Firebase
├── 📄 firestore.rules              # Reglas de seguridad Firestore
├── 📄 firestore.indexes.json       # Índices de Firestore
├── 📄 storage.rules                # Reglas de Storage
├── 📄 vercel.json                  # Configuración Vercel
├── 📄 package.json                 # Dependencias Node.js
├── 📄 .gitignore                   # Archivos a ignorar en Git
└── 📄 README.md                    # Documentación principal
```

## 📋 **Descripción de Carpetas**

### **🎨 Frontend**

- **`static/`** - Archivos estáticos (CSS, JS, imágenes)
- **`modulos/`** - Módulos del sistema (empleados, nóminas, etc.)
- **`src/`** - Código fuente organizado (componentes, servicios, etc.)

### **⚙️ Backend**

- **`main.py`** - Aplicación principal FastAPI
- **`google_drive.py`** - Integración con Google Drive
- **`export_functions.py`** - Funciones de exportación Excel

### **📚 Docs**

- **`GUIA_DESPLIEGUE_COMPLETA.md`** - Guía paso a paso para desplegar
- **`PRUEBAS_FINALES.md`** - Checklist de pruebas
- **`vercel-env-setup.md`** - Configuración de variables de entorno

### **🔧 Scripts**

- **`configurar-indices-firebase.js`** - Script para configurar índices
- **`deploy-complete.sh`** - Script de despliegue completo
- **`deploy.sh`** - Script de despliegue básico

### **🗂️ Temp**

- **`env.production.example`** - Ejemplo de variables de entorno
- **`config-vercel-env.bat`** - Script de configuración Windows

## 🚀 **Archivos de Configuración**

### **Firebase**

- **`firebase.json`** - Configuración principal de Firebase
- **`firestore.rules`** - Reglas de seguridad de Firestore
- **`firestore.indexes.json`** - Índices de Firestore
- **`storage.rules`** - Reglas de Storage

### **Vercel**

- **`vercel.json`** - Configuración de despliegue en Vercel
- **`package.json`** - Dependencias y scripts de Node.js

### **Git**

- **`.gitignore`** - Archivos a ignorar en Git
- **`.github/workflows/deploy.yml`** - CI/CD con GitHub Actions

## 📊 **Módulos del Sistema**

### **👥 Empleados**

- Gestión completa de personal
- CRUD de empleados
- Validaciones de datos

### **⏰ Horas**

- Control de tiempo y asistencia
- Registro de horas trabajadas
- Cálculo automático

### **💰 Nóminas**

- Cálculo automático de salarios
- Generación de reportes
- Exportación a Excel

### **🧮 Cuadre Caja**

- Control financiero
- Movimientos de caja
- Reportes financieros

### **📦 Inventario**

- Gestión de productos
- Control de stock
- Categorización

### **🎫 Membresías**

- Sistema de suscripciones
- Gestión de clientes
- Pagos y renovaciones

### **📊 Reportes**

- Análisis y estadísticas
- Gráficos y visualizaciones
- Exportación de datos

### **⚙️ Configuración**

- Ajustes del sistema
- Configuración de usuarios
- Parámetros generales

### **🤖 Chat IA**

- Asistente virtual inteligente
- 4 personalidades especializadas
- Historial de conversaciones

## 🔒 **Seguridad**

- **Reglas de Firestore** - Control de acceso a datos
- **Reglas de Storage** - Control de archivos
- **Autenticación** - Firebase Auth
- **Multi-tenancy** - Aislamiento por empresa

## 🚀 **Despliegue**

- **Frontend** - Vercel (Static Hosting)
- **Backend** - Firebase (Cloud Functions)
- **Base de Datos** - Firestore
- **Storage** - Firebase Storage
- **CI/CD** - GitHub Actions

## 📱 **Características**

- **PWA** - Progressive Web App
- **Responsive** - Adaptable a todos los dispositivos
- **Offline** - Funciona sin conexión
- **Multi-idioma** - Soporte para múltiples idiomas
- **Temas** - Modo claro y oscuro
- **Notificaciones** - Push notifications

---

**Estructura optimizada para desarrollo y producción** 🚀

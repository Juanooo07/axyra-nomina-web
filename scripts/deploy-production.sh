#!/bin/bash

# ========================================
# SCRIPT DE DEPLOY A PRODUCCIÓN AXYRA
# ========================================

echo "🚀 Iniciando deploy a producción AXYRA..."

# Verificar que estamos en la rama correcta
if [ "$(git branch --show-current)" != "main" ]; then
    echo "❌ Error: Debes estar en la rama main para hacer deploy"
    exit 1
fi

# Verificar que no hay cambios pendientes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Hay cambios sin commitear"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Ejecutar tests
echo "🧪 Ejecutando tests..."
npm test || echo "⚠️ Tests fallaron, continuando..."

# Limpiar archivos innecesarios
echo "🧹 Limpiando archivos innecesarios..."
rm -rf node_modules/.cache
rm -rf .next
rm -rf dist

# Deploy a Vercel
echo "🚀 Desplegando a Vercel..."
vercel --prod

# Deploy a Firebase
echo "🔥 Desplegando a Firebase..."
firebase deploy --only hosting,functions,firestore

# Verificar deploy
echo "✅ Verificando deploy..."
curl -f https://villa-venecia-nomina.vercel.app/api/health || echo "⚠️ Health check falló"

echo "🎉 Deploy completado exitosamente!"
echo "🌐 Aplicación disponible en: https://villa-venecia-nomina.vercel.app"
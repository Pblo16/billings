#!/bin/bash

# Script para preparar y desplegar la aplicación en Render
# Este script asegura que los assets estén compilados antes del deploy

set -e  # Salir si hay errores

echo "🚀 Preparando aplicación para deploy en Render..."

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "composer.json" ]; then
    echo "❌ Error: No se encontró composer.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# 2. Verificar que public/build no esté en .gitignore (debe estar comentado)
if grep -q "^/public/build" .gitignore; then
    echo "⚠️  Advertencia: /public/build está en .gitignore. Debe estar comentado para incluir assets."
    echo "   Ya se debería haber comentado automáticamente."
fi

# 2. Instalar dependencias de Node.js
echo "📦 Instalando dependencias de Node.js..."
pnpm install

# 3. Compilar assets
echo "🔨 Compilando assets..."
pnpm build

# 4. Verificar que los assets se compilaron correctamente
if [ ! -d "public/build" ]; then
    echo "❌ Error: No se encontró el directorio public/build. El build falló."
    exit 1
fi

if [ ! -f "public/build/manifest.json" ]; then
    echo "❌ Error: No se encontró public/build/manifest.json. El build falló."
    exit 1
fi

echo "✅ Assets compilados correctamente"

# 5. Verificar las rutas generadas por wayfinder
if [ ! -f "resources/js/routes/index.ts" ]; then
    echo "⚠️  Advertencia: No se encontró resources/js/routes/index.ts"
    echo "   Ejecuta 'php artisan wayfinder:generate' si es necesario"
else
    echo "✅ Rutas de wayfinder encontradas"
fi

# 6. Crear Dockerfile optimizado para producción
echo "🐳 Copiando Dockerfile optimizado..."
cp Dockerfile.production Dockerfile

echo ""
echo "✅ ¡Listo para deploy!"
echo ""
echo "Pasos siguientes:"
echo "1. Commit y push de los cambios:"
echo "   git add ."
echo "   git commit -m 'Prepare for deploy'"
echo "   git push origin main"
echo ""
echo "2. En Render, configura las variables de entorno según RENDER_ENV_SETUP.md"
echo "3. Deploy automático desde GitHub"
echo ""
echo "💡 El Dockerfile usa los assets ya compilados, evitando problemas con wayfinder"
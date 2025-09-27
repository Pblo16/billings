# 🐳 Estrategias de Deploy para Laravel + Inertia.js + Wayfinder

## El Problema

El plugin `@laravel/vite-plugin-wayfinder` necesita ejecutar `php artisan wayfinder:generate` durante el build, pero esto requiere PHP en el contenedor Node.js, lo cual complica el proceso.

## ✅ Solución Recomendada: Pre-compilar Assets

### Opción 1: Script Automático (Recomendado)

```bash
# Ejecutar el script preparado
./prepare-deploy.sh
```

Este script:
- ✅ Compila los assets localmente
- ✅ Usa Dockerfile.production (simple y confiable) 
- ✅ Evita problemas con wayfinder en Docker
- ✅ Verifica que todo esté listo

### Opción 2: Manual

```bash
# 1. Compilar assets localmente
pnpm build

# 2. Usar Dockerfile simple
cp Dockerfile.production Dockerfile

# 3. Deploy
git add . && git commit -m "Deploy ready" && git push
```

## 🔧 Alternativas (Para casos especiales)

### Si necesitas build automático completo

El `Dockerfile` actual está configurado para instalar PHP en el contenedor Node.js, pero es más complejo y lento.

### Si prefieres la imagen base richarvey

Usa `Dockerfile.production` - es más simple, rápida y confiable.

## 📋 Checklist de Deploy

- [ ] Assets compilados (`public/build/` existe)
- [ ] Rutas generadas (`resources/js/routes/index.ts`)
- [ ] Variables de entorno configuradas en Render
- [ ] Dockerfile optimizado copiado
- [ ] Código committed y pushed

## 🎯 Recomendación Final

**Usa `Dockerfile.production`** porque:
- ✅ Más rápido (no necesita compilar en container)
- ✅ Más confiable (evita problemas de PHP/Node)
- ✅ Más simple de debuggear
- ✅ Usa la imagen base que mencionaste (richarvey)
- ✅ Sigue las mejores prácticas de seguridad

Los assets se compilan localmente y se incluyen en el build, lo cual es perfectamente válido para aplicaciones estáticas como las de Inertia.js.
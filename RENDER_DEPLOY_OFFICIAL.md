# 🚀 Deploy Laravel + Inertia.js en Render (Documentación Oficial)

Esta guía sigue exactamente la [documentación oficial de Render](https://docs.render.com/deploy-php-laravel-docker) para Laravel con Docker.

## 📋 Pasos para Deploy

### 1. Preparar la aplicación

```bash
# 1. Compilar assets localmente (necesario para Inertia.js)
pnpm build

# 2. Usar Dockerfile optimizado para Render
cp Dockerfile.production Dockerfile

# 3. Commit y push
git add .
git commit -m "Deploy to Render"
git push origin main
```

### 2. Crear Base de Datos en Render

1. Ve a [Render Dashboard](https://dashboard.render.com/new/database)
2. Crea una nueva base de datos **PostgreSQL**
3. Copia la **URL interna de la base de datos** (Internal Database URL)

### 3. Crear Web Service en Render

1. Ve a [Render Dashboard](https://dashboard.render.com) 
2. Crea un nuevo **Web Service**
3. Conecta tu repositorio de GitHub
4. Selecciona **Docker** como runtime

### 4. Configurar Variables de Entorno

En la sección **Advanced** del Web Service, agrega estas variables:

| Variable        | Valor                                                    |
|----------------|----------------------------------------------------------|
| `DATABASE_URL` | La URL interna de tu base de datos PostgreSQL           |
| `DB_CONNECTION`| `pgsql`                                                  |
| `APP_KEY`      | `base64:U718pG3vPoGZ5LTo+R+CtfZcWvQ5XTWm1pBZvZgMhE0=`    |
| `APP_ENV`      | `production`                                             |
| `APP_DEBUG`    | `false`                                                  |
| `APP_URL`      | `https://tu-app.onrender.com`                           |
| `SESSION_DRIVER` | `database`                                             |
| `LOG_CHANNEL`  | `stderr`                                                 |

### 5. Variables Adicionales (Opcionales)

| Variable    | Valor                           | Propósito                    |
|-------------|--------------------------------|------------------------------|
| `ASSET_URL` | `https://tu-app.onrender.com`  | Forzar HTTPS para assets     |
| `CACHE_STORE` | `database`                    | Usar base de datos para cache |

## 🔧 Modificaciones Realizadas

### ✅ AppServiceProvider configurado
- Fuerza HTTPS en producción según documentación oficial

### ✅ Dockerfile optimizado  
- Basado en `richarvey/nginx-php-fpm:3.1.6`
- Incluye extensiones PostgreSQL
- Script de deploy automático

### ✅ Assets pre-compilados
- Evita problemas con wayfinder durante el build
- Assets compilados localmente y incluidos en el deploy

### ✅ Deploy script
- Instala composer dependencies
- Cachea configuración y rutas  
- Ejecuta migraciones automáticamente

## 🎯 Resultado

Tu aplicación Laravel + Inertia.js estará disponible en tu URL de Render una vez terminado el build.

## 🐛 Troubleshooting

Si tienes problemas:

1. **Revisa los logs** en Render Dashboard > tu servicio > Logs
2. **Verifica las variables de entorno** están configuradas correctamente
3. **Asegúrate** de que `DATABASE_URL` sea la URL **interna** (no externa)
4. **Confirma** que los assets están compilados (`public/build/` debe existir)

## 📧 Soporte

Si necesitas ayuda adicional, contacta a Render en support@render.com
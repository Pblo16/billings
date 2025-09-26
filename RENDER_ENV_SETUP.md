# Configuración de Variables de Entorno en Render

## ⚠️ IMPORTANTE: Seguridad

**NUNCA** incluyas credenciales reales en el Dockerfile. Las variables de entorno se configuran de forma segura en el panel de Render.

## Configuración en Render

1. Ve a tu servicio en Render
2. Navega a **Environment** 
3. Haz clic en **Add Environment Variable**
4. Agrega las siguientes variables una por una:

### Variables Requeridas

```
APP_NAME=SGI
APP_ENV=production
APP_KEY=base64:GENERAR_NUEVA_CLAVE_AQUI
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=https://tu-app.onrender.com
```

### Base de Datos (PostgreSQL en Render)

```
DB_CONNECTION=postgresql
DB_HOST=dpg-d3bi4or7mgec739ntjk0-a
DB_PORT=5432
DB_DATABASE=sgi_secret
DB_USERNAME=sgi_secret_user
DB_PASSWORD=YXv9kv8h1FzEIJzyFOu8dCWmKGBE1JIs
```

### Otras Variables

```
LOG_CHANNEL=stderr
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

## Generar APP_KEY

Para generar una nueva `APP_KEY` segura, ejecuta localmente:

```bash
php artisan key:generate --show
```

Copia el resultado y úsalo como valor de `APP_KEY` en Render.

## ⚡ Ventajas de usar Variables de Entorno en Render

- ✅ **Seguridad**: Las credenciales están encriptadas y no son visibles en el código
- ✅ **Flexibilidad**: Puedes cambiar configuraciones sin rebuilds
- ✅ **Múltiples entornos**: Diferentes configuraciones para staging/producción
- ✅ **Colaboración**: El equipo puede trabajar sin exponer credenciales

## Verificar Variables

Una vez desplegado, puedes verificar que las variables se cargaron correctamente creando una ruta temporal:

```php
// En routes/web.php (SOLO PARA TESTING - REMOVER DESPUÉS)
Route::get('/env-test', function() {
    return [
        'APP_ENV' => config('app.env'),
        'DB_CONNECTION' => config('database.default'),
        'APP_URL' => config('app.url'),
        // NO expongas credenciales reales
    ];
});
```
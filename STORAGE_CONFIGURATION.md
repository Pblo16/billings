# Configuración de Almacenamiento de Documentos

Este documento explica cómo cambiar el disco de almacenamiento para los documentos de usuarios (CVs, etc.).

## Variable de Configuración

El disco de almacenamiento se controla mediante la variable de entorno `DOCUMENTS_DISK` en tu archivo `.env`.

### Opciones Disponibles

#### Para Desarrollo/Pruebas (Local)

```env
DOCUMENTS_DISK=public
```

- Los archivos se almacenan en `storage/app/public/`
- Accesibles mediante URL local: `http://localhost/storage/`
- No requiere configuración adicional

#### Para Producción (Backblaze B2)

```env
DOCUMENTS_DISK=backblaze
```

- Los archivos se almacenan en Backblaze B2
- Genera URLs temporales firmadas (válidas por 10 minutos)
- Requiere configuración de credenciales B2 en `.env`:
  ```env
  B2_KEY_ID=your_key_id
  B2_APPLICATION_KEY=your_app_key
  B2_REGION=us-east-005
  B2_BUCKET=sgi-bucket
  B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com
  ```

## Cómo Cambiar el Disco

1. Abre tu archivo `.env`
2. Modifica la variable `DOCUMENTS_DISK`:

   ```env
   # Para pruebas locales
   DOCUMENTS_DISK=public

   # Para producción
   DOCUMENTS_DISK=backblaze
   ```

3. Limpia la caché de configuración:
   ```bash
   ./vendor/bin/sail artisan config:clear
   ```

## Ubicación de la Configuración

La configuración se encuentra en:

- **Variable de entorno**: `.env` → `DOCUMENTS_DISK`
- **Archivo de config**: `config/filesystems.php` → `documents_disk`
- **Uso en código**: `config('filesystems.documents_disk')`

## Controladores que Usan Esta Configuración

Los siguientes controladores utilizan automáticamente el disco configurado:

- `UsersController`: Para subir y gestionar CVs de usuarios
- Cualquier controlador que use el trait `HandlesDocuments`

## Migración de Documentos

Si cambias de disco después de haber subido archivos, necesitarás migrar los documentos existentes:

```bash
# Script de migración (crear si es necesario)
./vendor/bin/sail artisan documents:migrate-disk --from=public --to=backblaze
```

## Notas Importantes

- ⚠️ Los documentos existentes mantienen su disco original en la base de datos
- ⚠️ Nuevos documentos se subirán al disco configurado en `DOCUMENTS_DISK`
- ⚠️ Cada documento recuerda en qué disco está almacenado (campo `disk` en tabla `documents`)
- ✅ El sistema genera automáticamente el tipo correcto de URL según el disco
- ✅ No necesitas cambiar código al cambiar de disco

## Estructura de Base de Datos

La tabla `documents` tiene un campo `disk` que almacena el nombre del disco:

```sql
documents
  - id
  - name
  - path
  - disk          <- Almacena 'public', 'backblaze', etc.
  - mime_type
  - size
  - uploaded_by_id
  - timestamps
```

Esto permite tener documentos en diferentes discos simultáneamente.

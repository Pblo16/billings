# Guía: Comando make:inertia

## 🚀 Descripción

El comando `sail artisan make:inertia` es un generador completo de CRUD para Laravel + Inertia + React. Crea automáticamente modelos, migraciones, controladores, vistas React y rutas con un flujo interactivo.

## 📋 Características Principales

### 1. Generación Modular

Puedes elegir qué componentes generar:

- ✅ **Model**: Modelo de Eloquent
- ✅ **Migration**: Migración de base de datos
- ✅ **Controller**: Controlador con operaciones CRUD
- ✅ **Inertia Views**: Páginas React (Index, Create, Edit)
- ✅ **Routes**: Rutas en `web.php`
- ✅ **All**: Todos los componentes

### 2. Actualización de Migraciones Existentes

**Nueva funcionalidad**: Si la migración ya existe, puedes agregar nuevos campos sin recrearla.

#### Flujo de Actualización:

1. El comando detecta si la migración existe
2. Te pregunta si deseas agregar nuevos campos
3. Si aceptas, defines los nuevos campos
4. Actualiza automáticamente:
   - ✅ Migración (agrega los campos nuevos)
   - ✅ Modelo `$fillable` (agrega los campos sin duplicar)
   - ✅ Tipos TypeScript (actualiza interfaces existentes)
   - ✅ Controlador (opcional, pregunta antes de actualizar)
   - ✅ Vistas React (opcional, pregunta antes de actualizar)

### 3. Campos Solo Cuando se Necesitan

- Los campos se solicitan **únicamente** cuando se va a crear o modificar una migración
- Si no seleccionas "Migration", no te pedirá campos
- Esto optimiza el flujo cuando solo quieres regenerar vistas o controladores

## 🎯 Casos de Uso

### Caso 1: Crear un CRUD completo desde cero

```bash
sail artisan make:inertia Post
```

1. Selecciona "All"
2. Define los campos (title, content, published_at, etc.)
3. Todo se genera automáticamente

### Caso 2: Solo crear el controlador

```bash
sail artisan make:inertia Post
```

1. Selecciona solo "Controller"
2. No te pedirá campos (ya que no hay migración)
3. Genera solo el controlador

### Caso 3: Agregar nuevos campos a un modelo existente

```bash
sail artisan make:inertia Post
```

1. Selecciona "Migration"
2. El comando detecta que la migración ya existe
3. Pregunta: "Do you want to add new fields to the existing migration?"
4. Define los nuevos campos (ej: `author`, `tags`)
5. Actualiza:
   - Migración (agrega los campos)
   - Modelo (actualiza `$fillable`)
   - Tipos TypeScript (actualiza las interfaces)
6. Opcionalmente actualiza controlador y vistas

### Caso 4: Regenerar solo las vistas

```bash
sail artisan make:inertia Post
```

1. Selecciona solo "Inertia Views"
2. No te pedirá campos
3. Regenera las vistas React

## 🔧 Estructura de Archivos Generados

### Para: `Post`

```
app/Models/Post.php
database/migrations/xxxx_create_posts_table.php
app/Http/Controllers/PostController.php
resources/js/pages/Post/Index.tsx
resources/js/pages/Post/Create.tsx
resources/js/pages/Post/Edit.tsx
resources/js/types/index.d.ts (tipos agregados)
routes/web.php (ruta agregada)
```

### Para: `Admin/Role`

```
app/Models/Admin/Role.php
database/migrations/xxxx_create_roles_table.php
app/Http/Controllers/Admin/RoleController.php
resources/js/pages/Admin/Role/Index.tsx
resources/js/pages/Admin/Role/Create.tsx
resources/js/pages/Admin/Role/Edit.tsx
resources/js/types/index.d.ts (tipos agregados)
routes/web.php (ruta agregada)
```

## 💡 Ventajas de la Actualización

### Antes:

- ❌ Si la migración existía, fallaba o duplicaba código
- ❌ Siempre pedía campos, incluso si no los necesitabas
- ❌ No podías agregar campos nuevos fácilmente

### Ahora:

- ✅ Detecta migraciones existentes
- ✅ Permite agregar campos sin recrear archivos
- ✅ Solo pide campos cuando es necesario
- ✅ Actualiza automáticamente todos los archivos relacionados
- ✅ Previene duplicación de campos en `$fillable`
- ✅ Mantiene la coherencia entre backend y frontend

## 🎨 Ejemplo Completo: Agregar Campos a Post

### Situación Inicial

Tienes un modelo `Post` con:

```php
protected $fillable = [
    'title',
    'content',
];
```

### Ejecutar el Comando

```bash
sail artisan make:inertia Post
```

### Flujo Interactivo

```
What would you like to generate?
→ Migration

Migration for Post already exists!
Do you want to add new fields to the existing migration? (yes/no) [yes]:
→ yes

You will add new fields to the existing migration.

Field name: author
Select data type for 'author': string
Can 'author' be nullable? (yes/no) [no]:
→ no

Field name: published_at
Select data type for 'published_at': datetime
Can 'published_at' be nullable? (yes/no) [no]:
→ yes

Field name: (Press Ctrl+C to finish)
→ Ctrl+C
```

### Resultado

**Migración actualizada:**

```php
$table->id();
$table->string('title');
$table->text('content');
$table->string('author');  // ← Nuevo
$table->datetime('published_at')->nullable();  // ← Nuevo
$table->timestamps();
```

**Modelo actualizado:**

```php
protected $fillable = [
    'title',
    'content',
    'author',        // ← Nuevo
    'published_at',  // ← Nuevo
];
```

**Tipos TypeScript actualizados:**

```typescript
export interface Post {
  id: number
  title: string
  content: string
  author: string // ← Nuevo
  published_at?: string // ← Nuevo
  created_at?: string
  updated_at?: string
}
```

## 🛠️ Consideraciones Técnicas

### Detección de Migraciones

- Busca archivos que coincidan con: `*_create_{model}s_table.php`
- Usa el último archivo encontrado (por timestamp)

### Actualización de $fillable

- Detecta el array existente con regex
- Agrega solo campos nuevos (no duplica)
- Mantiene el formato y estilo

### Actualización de Tipos TypeScript

- Busca la interface existente
- Inserta nuevos campos antes de los timestamps
- Actualiza tanto la interface principal como la Form

### Preguntas Opcionales

Cuando actualizas una migración y los archivos ya existen:

- ✅ Pregunta si quieres actualizar el **controlador**
- ✅ Pregunta si quieres actualizar las **vistas React**
- Esto evita sobrescribir cambios personalizados

## 📚 Mejores Prácticas

1. **Agregar campos**: Usa el modo de actualización en lugar de editar manualmente
2. **Mantén coherencia**: El comando actualiza todos los archivos relacionados
3. **Revisa cambios**: Antes de migrar, revisa los archivos generados
4. **Backup**: Considera hacer commit antes de actualizar archivos existentes

## 🔄 Migración Automática

El comando ejecuta automáticamente `sail artisan migrate` al final si:

- Se creó una nueva migración, o
- Se actualizó una migración existente

## 📝 Notas

- Todos los comandos deben ejecutarse vía Sail: `sail artisan make:inertia`
- Los tipos de datos soportados: string, text, integer, bigInteger, boolean, date, datetime, timestamp, decimal, float, json, foreignId
- El comando respeta las convenciones de Laravel (Eloquent, Form Requests, etc.)

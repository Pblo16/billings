# HandlesDocuments Trait

Trait reutilizable para manejar la subida, eliminación y gestión de documentos en cualquier modelo de Laravel con relación polimórfica.

## Instalación

El trait ya está creado en `app/Traits/HandlesDocuments.php`. Solo necesitas incluirlo en tu controlador:

```php
use App\Traits\HandlesDocuments;

class YourController extends Controller
{
    use HandlesDocuments;

    // ... tus métodos
}
```

## Métodos Disponibles

### 1. `uploadDocument()`

Sube un archivo y lo asocia a un modelo mediante una relación polimórfica.

**Parámetros:**

- `file` (UploadedFile): El archivo subido
- `relatedModel` (Model): El modelo al que se asociará el documento
- `relationType` (string): Tipo de relación (ej: 'cv', 'invoice', 'contract', 'license')
- `storagePath` (string): Ruta de almacenamiento (default: 'documents')
- `disk` (string): Disco de almacenamiento (default: 'public')

**Retorna:** `Document` - El documento creado

**Ejemplo:**

```php
if ($request->hasFile('cv')) {
    $this->uploadDocument(
        file: $request->file('cv'),
        relatedModel: $user,
        relationType: 'cv',
        storagePath: 'cvs'
    );
}
```

### 2. `deleteDocumentFromModel()`

Elimina un documento asociado a un modelo (archivo físico + registros en BD).

**Parámetros:**

- `relatedModel` (Model): El modelo del que se eliminará el documento
- `documentId` (int|string): ID del documento a eliminar
- `relationType` (string|null): Filtrar por tipo (opcional)
- `disk` (string): Disco de almacenamiento (default: 'public')

**Retorna:** `RedirectResponse` - Redirección con mensaje de éxito/error

**Ejemplo:**

```php
public function deleteDocument(User $user, $documentId)
{
    return $this->deleteDocumentFromModel(
        relatedModel: $user,
        documentId: $documentId,
        relationType: 'cv' // opcional
    );
}
```

### 3. `replaceDocument()`

Reemplaza un documento existente con uno nuevo. Elimina el anterior automáticamente.

**Parámetros:**

- `file` (UploadedFile): El nuevo archivo
- `relatedModel` (Model): El modelo asociado
- `relationType` (string): Tipo de relación
- `storagePath` (string): Ruta de almacenamiento (default: 'documents')
- `disk` (string): Disco (default: 'public')

**Retorna:** `Document` - El nuevo documento creado

**Ejemplo:**

```php
if ($request->hasFile('cv')) {
    $this->replaceDocument(
        file: $request->file('cv'),
        relatedModel: $user,
        relationType: 'cv',
        storagePath: 'cvs'
    );
}
```

### 4. `getDocuments()`

Obtiene todos los documentos asociados a un modelo.

**Parámetros:**

- `relatedModel` (Model): El modelo
- `relationType` (string|null): Filtrar por tipo (opcional)

**Retorna:** `Collection` - Colección de documentos

**Ejemplo:**

```php
// Todos los documentos
$allDocuments = $this->getDocuments($user);

// Solo CVs
$cvs = $this->getDocuments($user, 'cv');

// Solo facturas
$invoices = $this->getDocuments($company, 'invoice');
```

## Ejemplos de Uso Completo

### Caso 1: Gestión de CV en UsersController

```php
class UsersController extends Controller
{
    use HandlesDocuments;

    public function store(Request $request)
    {
        $user = User::create($request->validated());

        if ($request->hasFile('cv')) {
            $this->uploadDocument(
                file: $request->file('cv'),
                relatedModel: $user,
                relationType: 'cv',
                storagePath: 'cvs'
            );
        }

        return redirect()->route('users');
    }

    public function update(Request $request, User $user)
    {
        $user->update($request->validated());

        if ($request->hasFile('cv')) {
            $this->replaceDocument(
                file: $request->file('cv'),
                relatedModel: $user,
                relationType: 'cv',
                storagePath: 'cvs'
            );
        }

        return redirect()->route('users');
    }

    public function deleteDocument(User $user, $documentId)
    {
        return $this->deleteDocumentFromModel($user, $documentId, 'cv');
    }
}
```

### Caso 2: Múltiples tipos de documentos

```php
class CompanyController extends Controller
{
    use HandlesDocuments;

    public function store(Request $request)
    {
        $company = Company::create($request->validated());

        // Subir diferentes tipos de documentos
        if ($request->hasFile('license')) {
            $this->uploadDocument(
                $request->file('license'),
                $company,
                'license',
                'licenses'
            );
        }

        if ($request->hasFile('contract')) {
            $this->uploadDocument(
                $request->file('contract'),
                $company,
                'contract',
                'contracts'
            );
        }

        return redirect()->route('companies');
    }

    public function show(Company $company)
    {
        return Inertia::render('Companies/Show', [
            'company' => $company,
            'licenses' => $this->getDocuments($company, 'license'),
            'contracts' => $this->getDocuments($company, 'contract'),
        ]);
    }
}
```

## Ruta para Eliminar Documentos

Agrega la ruta en `routes/web.php`:

```php
Route::delete('users/{user}/documents/{document}', [UsersController::class, 'deleteDocument'])
    ->name('users.documents.delete');

// O para cualquier otro modelo
Route::delete('companies/{company}/documents/{document}', [CompanyController::class, 'deleteDocument'])
    ->name('companies.documents.delete');
```

## Tipos de Relación Comunes

Usa nombres descriptivos para `relationType`:

- `'cv'` - Currículum vitae
- `'invoice'` - Factura
- `'contract'` - Contrato
- `'license'` - Licencia
- `'certificate'` - Certificado
- `'id_card'` - Documento de identidad
- `'receipt'` - Recibo
- `'report'` - Reporte
- `'photo'` - Fotografía
- `'logo'` - Logo

## Validación Recomendada

```php
$request->validate([
    'cv' => 'nullable|file|mimes:pdf|max:10240', // 10MB
    'invoice' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5MB
    'photo' => 'nullable|file|mimes:jpg,jpeg,png|max:2048', // 2MB
]);
```

## Estructura de Base de Datos

El trait trabaja con dos tablas:

### `documents`

```php
id
name           // Nombre original del archivo
path           // Ruta en storage
mime_type      // Tipo MIME
size           // Tamaño en bytes
uploaded_by_id // Usuario que subió (nullable)
timestamps
```

### `document_relations`

```php
id
document_id    // FK a documents
related_type   // Clase del modelo (polymorphic)
related_id     // ID del modelo (polymorphic)
relation_type  // Tipo: 'cv', 'invoice', etc.
timestamps
```

## Ventajas

✅ **Reutilizable**: Un solo trait para todos tus controladores
✅ **Polimórfico**: Funciona con cualquier modelo
✅ **Flexible**: Múltiples tipos de documentos por modelo
✅ **Seguro**: Elimina archivos físicos y registros en BD
✅ **Limpio**: Código organizado y fácil de mantener
✅ **Testeable**: Métodos independientes fáciles de probar

## Notas Importantes

1. **Storage Link**: Asegúrate de haber ejecutado `php artisan storage:link`
2. **Permisos**: Verifica permisos de escritura en `storage/app/public/`
3. **Validación**: Siempre valida archivos antes de subirlos
4. **Tamaño**: Configura `upload_max_filesize` y `post_max_size` en `php.ini`
5. **Limpieza**: Considera implementar limpieza automática de archivos huérfanos

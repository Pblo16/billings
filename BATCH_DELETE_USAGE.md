# Guía de Uso: Batch Delete en DataTable

## Resumen
Esta guía explica cómo habilitar la funcionalidad de selección múltiple y eliminación por lotes (batch delete) en el componente `DataTable`.

## Configuración

### 1. Crear Ruta de Backend

Primero, agrega una ruta en `routes/web.php` para manejar la eliminación por lotes:

```php
Route::delete('admin/security/role/batch-delete', [RoleController::class, 'batchDelete'])
    ->name('admin.security.role.batchDelete');
```

### 2. Implementar Método en el Controlador

Agrega el método `batchDelete` en tu controlador:

```php
public function batchDelete(Request $request)
{
    $ids = $request->input('ids', []);
    
    if (empty($ids) || !is_array($ids)) {
        return response()->json(['error' => 'No se proporcionaron IDs válidos.'], 400);
    }

    try {
        $deletedCount = YourModel::whereIn('id', $ids)->delete();
        return response()->json(['message' => "$deletedCount registros eliminados exitosamente."]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error al eliminar: ' . $e->getMessage()], 500);
    }
}
```

### 3. Regenerar Rutas TypeScript

Después de crear la ruta en Laravel, genera las rutas TypeScript:

```bash
sail artisan wayfinder:generate
```

### 4. Configurar en el Frontend

En tu componente de índice (por ejemplo, `Index.tsx`):

```tsx
import { batchDelete } from '@/routes/admin/security/role'

const YourIndex = () => {
  const refetchRef = useRef<(() => void) | null>(null)

  const columns = getColumns({
    onActionSuccess: () => {
      refetchRef.current?.()
    },
    actionsConfig: {
      canEdit: true,
      canDelete: true,
    },
    // Habilitar batch delete en las columnas
    batchDelete: {
      enabled: true,
      deleteUrl: batchDelete().url,
    },
  })

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable
        apiUrl={paginated().url}
        columns={columns}
        header={headerActions}
        // Configuración de batch delete
        batchDeleteConfig={{
          enabled: true,
          deleteUrl: batchDelete().url,
        }}
        onRefetch={(refetch) => {
          refetchRef.current = refetch
        }}
      />
    </AppLayout>
  )
}
```

## Opciones de Configuración

### `batchDeleteConfig`

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `enabled` | `boolean` | Habilita/deshabilita la funcionalidad de batch delete |
| `deleteUrl` | `string` | URL del endpoint para eliminar múltiples registros |
| `onDelete` | `(ids: number[]) => void` | Handler personalizado para la eliminación (opcional) |

## Comportamiento

1. **Selección de filas**: Cuando `batchDelete.enabled` es `true`, aparece una columna de checkbox al inicio de la tabla.

2. **Select all**: El checkbox en el header permite seleccionar/deseleccionar todas las filas de la página actual.

3. **Botón de eliminación**: Cuando hay filas seleccionadas, aparece un botón "Delete Selected" con el conteo de filas seleccionadas.

4. **Confirmación**: Al hacer clic en el botón, se muestra un diálogo de confirmación.

5. **Eliminación**: Si se confirma, se envía una petición DELETE al backend con los IDs seleccionados.

6. **Actualización**: Después de la eliminación exitosa, la tabla se actualiza automáticamente.

## Ejemplo Completo

Ver implementación en:
- **Frontend**: `resources/js/pages/admin/security/roles/Index.tsx`
- **Backend**: `app/Http/Controllers/Admin/Security/RoleController.php`
- **Rutas**: `routes/web.php`

## Notas Importantes

- Los registros deben tener un campo `id` para que funcione correctamente.
- El backend debe validar los permisos del usuario antes de eliminar.
- Considera agregar protección contra eliminación de registros críticos (como en el ejemplo de roles, donde el rol "super-admin" está protegido).

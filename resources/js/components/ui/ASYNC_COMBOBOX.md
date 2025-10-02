# AsyncCombobox Component

Componente de selección con búsqueda asíncrona o opciones manuales.

## Características

- **Búsqueda asíncrona**: Busca opciones en un endpoint de API
- **Opciones manuales**: Permite pasar opciones estáticas sin búsqueda
- **Paginación configurable**: Controla cuántos resultados mostrar con `show`
- **Debounce**: Evita búsquedas excesivas mientras el usuario escribe
- **Cache de selección**: Mantiene la opción seleccionada visible incluso si no está en las opciones actuales
- **Manejo de errores**: Muestra mensajes de error cuando la API falla

## Props

```typescript
interface AsyncComboboxProps {
  value?: string | number // Valor seleccionado
  onChange?: (value: string | number) => void // Callback al cambiar
  readOnly?: boolean // Solo lectura
  searchUrl?: string // URL del endpoint (opcional si usas options)
  options?: { value: string; label: string }[] // Opciones manuales
  placeholder?: string // Texto del placeholder
  emptyMessage?: string // Mensaje cuando no hay resultados
  debounceMs?: number // Delay del debounce (default: 300ms)
  show?: number // Cantidad a mostrar en paginación (default: 10)
}
```

## Uso

### 1. Con búsqueda asíncrona (solo URL)

```tsx
<AsyncCombobox
  searchUrl="/api/users"
  value={userId}
  onChange={setUserId}
  show={10} // Mostrar 10 resultados
  placeholder="Search user..."
/>
```

**Requisitos del endpoint:**

- Debe aceptar parámetros `search` y `per_page` en query string
- Debe retornar un array de objetos con `value` (string) y `label` (string)
- Debe aceptar parámetro `id` para buscar una opción específica por ID

```typescript
// Ejemplo de respuesta esperada
;[
  { value: '1', label: 'John Doe (john@example.com)' },
  { value: '2', label: 'Jane Smith (jane@example.com)' },
  // ...
]
```

**Ejemplo de endpoint en Laravel:**

```php
public function paginatedUsers(Request $request)
{
    $query = User::query();

    // Si se busca por ID específico (para obtener una opción seleccionada)
    if ($id = $request->input('id')) {
        $user = User::find($id);
        if ($user) {
            return response()->json([
                [
                    'value' => (string) $user->id,
                    'label' => $user->name . ' (' . $user->email . ')',
                ]
            ]);
        }
        return response()->json([]);
    }

    // Apply search filter
    if ($search = $request->input('search')) {
        $query->where('name', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%");
    }

    // Get limited results
    $perPage = $request->input('per_page', 10);
    $users = $query->limit($perPage)->get();

    // Format for combobox: array of {value, label}
    $formatted = $users->map(function ($user) {
        return [
            'value' => (string) $user->id,
            'label' => $user->name . ' (' . $user->email . ')',
        ];
    });

    return response()->json($formatted);
}
```

### 2. Con opciones manuales (sin búsqueda)

```tsx
<AsyncCombobox
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ]}
  value={selectedValue}
  onChange={setSelectedValue}
/>
```

### 3. En FormFieldConfig

```typescript
const formFieldsConfig: FormFieldConfig[] = [
  {
    name: 'user_id',
    label: 'User',
    type: 'select',
    placeholder: {
      create: 'Search user...',
      edit: 'Search user...',
    },
    description: {
      create: 'Search and select a user.',
      edit: 'Search and select a user.',
    },
    searchUrl: '/api/users',
    show: 15, // Mostrar 15 resultados (opcional, default: 10)
  },
]
```

### 4. Opciones manuales en FormFieldConfig

```typescript
const formFieldsConfig: FormFieldConfig[] = [
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    placeholder: {
      create: 'Select status...',
      edit: 'Select status...',
    },
    description: {
      create: 'Select the status.',
      edit: 'Select the status.',
    },
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ],
  },
]
```

## Comportamiento

### Búsqueda Asíncrona (`searchUrl` presente)

1. Al abrir, muestra mensaje "Type to search..."
2. Al escribir, busca automáticamente después del debounce (300ms por defecto)
3. Muestra loading spinner durante la búsqueda
4. Muestra hasta `show` resultados
5. Si hay error, muestra mensaje de error con detalles
6. Al seleccionar, cachea la opción para mostrarla después
7. Al cerrar y reabrir, limpia las opciones (para nueva búsqueda)

### Opciones Manuales (`options` presente)

1. Muestra todas las opciones inmediatamente
2. No realiza búsquedas en el servidor
3. Filtra localmente con el input (si el Command lo soporta)

## Manejo de Errores

El componente maneja automáticamente los siguientes errores:

- **Error de red**: Cuando no se puede conectar al servidor
- **Error de respuesta**: Cuando el servidor responde con un código de error
- **Formato inválido**: Cuando la respuesta no es un array

Cuando ocurre un error:

1. Se muestra un mensaje de error en rojo dentro del combobox
2. Se registra el error en la consola para debugging
3. Las opciones se limpian para evitar datos incorrectos

## Validaciones

El componente realiza las siguientes validaciones:

- Verifica que `options` sea un array antes de usar `.find()`
- Valida que la respuesta de la API sea un array
- Maneja valores `null` o `undefined` correctamente
- Convierte valores numéricos automáticamente

## Notas

- Si no pasas ni `searchUrl` ni `options`, el componente mostrará el mensaje de vacío
- `show` solo aplica a búsqueda asíncrona (no afecta opciones manuales)
- El componente convierte valores numéricos automáticamente al seleccionar
- El cache de selección asegura que siempre puedas ver qué opción está seleccionada
- Los valores siempre se envían como string en las peticiones, pero se convierten a número si es posible al seleccionar

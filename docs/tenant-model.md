# Modelo Tenant - Relaciones y Características

El modelo `App\Models\Tenant` ha sido mejorado con relaciones, métodos auxiliares y funcionalidades adicionales para la gestión completa de tenants en el sistema de multi-tenancy.

## Estructura de la Base de Datos

### Tabla `tenants`

```sql
- id (string, primary key)
- name (string, nullable) - Nombre del tenant
- slug (string, unique, nullable) - Slug único para URLs
- description (text, nullable) - Descripción del tenant
- is_active (boolean, default: true) - Estado activo/inactivo
- trial_ends_at (timestamp, nullable) - Fecha de fin del periodo de prueba
- suspended_at (timestamp, nullable) - Fecha de suspensión
- created_at (timestamp)
- updated_at (timestamp)
- data (json, nullable) - Datos adicionales en formato JSON
```

### Tabla `domains`

```sql
- id (increments, primary key)
- domain (string, unique) - Dominio del tenant
- tenant_id (string, foreign key) - Referencia al tenant
- created_at (timestamp)
- updated_at (timestamp)
```

## Relaciones

### `domains()` - HasMany

Relación uno a muchos con la tabla domains. Un tenant puede tener múltiples dominios.

```php
$tenant = Tenant::find('tenant-id');
$domains = $tenant->domains; // Colección de dominios
$domainsCount = $tenant->domains()->count(); // Cantidad de dominios
```

## Atributos Computados (Accessors)

### `primary_domain`

Obtiene el primer dominio del tenant.

```php
$primaryDomain = $tenant->primary_domain; // string|null
```

### `is_on_trial`

Verifica si el tenant está actualmente en periodo de prueba.

```php
$isOnTrial = $tenant->is_on_trial; // boolean
```

### `is_suspended`

Verifica si el tenant está suspendido.

```php
$isSuspended = $tenant->is_suspended; // boolean
```

### `trial_expired`

Verifica si el periodo de prueba ha expirado.

```php
$trialExpired = $tenant->trial_expired; // boolean
```

## Scopes (Consultas Filtradas)

### `active()`

Filtra tenants activos (is_active = true y suspended_at = null).

```php
$activeTenants = Tenant::active()->get();
```

### `inactive()`

Filtra tenants inactivos.

```php
$inactiveTenants = Tenant::inactive()->get();
```

### `suspended()`

Filtra tenants suspendidos.

```php
$suspendedTenants = Tenant::suspended()->get();
```

### `onTrial()`

Filtra tenants que están actualmente en periodo de prueba.

```php
$tenantsOnTrial = Tenant::onTrial()->get();
```

### `trialExpired()`

Filtra tenants con periodos de prueba expirados.

```php
$expiredTrials = Tenant::trialExpired()->get();
```

## Métodos Auxiliares

### Gestión de Contexto

#### `run(callable $callback)`

Ejecuta un callback dentro del contexto del tenant.

```php
$tenant->run(function() {
    // Código que se ejecuta en el contexto del tenant
    $users = User::all(); // Users de este tenant específico
});
```

### Gestión de Dominios

#### `hasDomain(string $domain): bool`

Verifica si el tenant tiene un dominio específico.

```php
$hasDomain = $tenant->hasDomain('example.com');
```

#### `createDomain($data): Domain`

Crea un nuevo dominio para el tenant (método heredado del trait HasDomains).

```php
$domain = $tenant->createDomain(['domain' => 'nuevo-dominio.com']);
// o simplemente
$domain = $tenant->createDomain('nuevo-dominio.com');
```

### Gestión de Datos JSON

#### `getData(string $key, $default = null)`

Obtiene un valor específico del campo JSON `data`.

```php
$value = $tenant->getData('config.theme', 'default');
```

#### `setData(string $key, $value): self`

Establece un valor en el campo JSON `data`.

```php
$tenant->setData('config.theme', 'dark')
       ->setData('settings.notifications', true);
```

### Gestión de Estados

#### `suspend(?string $reason = null): self`

Suspende el tenant y opcionalmente guarda una razón.

```php
$tenant->suspend('Non-payment');
```

#### `reactivate(): self`

Reactiva un tenant suspendido.

```php
$tenant->reactivate();
```

#### `startTrial(int $days = 14): self`

Inicia un periodo de prueba para el tenant.

```php
$tenant->startTrial(30); // 30 días de prueba
```

#### `endTrial(): self`

Termina el periodo de prueba del tenant.

```php
$tenant->endTrial();
```

## Ejemplos de Uso

### Crear un nuevo tenant

```php
$tenant = Tenant::create([
    'id' => 'empresa-abc',
    'name' => 'Empresa ABC',
    'slug' => 'empresa-abc',
    'description' => 'Descripción de la empresa ABC'
]);

// Agregar dominio
$tenant->createDomain('empresa-abc.miapp.com');

// Iniciar periodo de prueba
$tenant->startTrial(30);
```

### Consultas avanzadas

```php
// Tenants activos con dominio específico
$tenant = Tenant::active()
    ->whereHas('domains', function($query) {
        $query->where('domain', 'like', '%.miapp.com');
    })
    ->first();

// Tenants con trial expirado que necesitan suspensión
$expiredTrials = Tenant::trialExpired()
    ->active()
    ->get();

foreach ($expiredTrials as $tenant) {
    $tenant->suspend('Trial expired');
}
```

### Trabajar con datos del tenant

```php
// Configuración del tenant
$tenant->setData('billing.plan', 'premium')
       ->setData('features.api_access', true)
       ->setData('limits.users', 100)
       ->save();

// Leer configuración
$plan = $tenant->getData('billing.plan');
$userLimit = $tenant->getData('limits.users', 10); // default: 10
```

## Consideraciones de Seguridad

1. **Validación de dominios**: Los dominios se validan automáticamente para evitar duplicados.
2. **Contexto de tenant**: Usar siempre el método `run()` para ejecutar código en el contexto correcto.
3. **Estados del tenant**: Verificar siempre `is_active` y `suspended_at` antes de permitir acceso.

## Eventos Automáticos

El modelo dispara eventos automáticos para las siguientes acciones:

- `SavingTenant` / `TenantSaved`
- `CreatingTenant` / `TenantCreated`
- `UpdatingTenant` / `TenantUpdated`
- `DeletingTenant` / `TenantDeleted`

Estos eventos pueden ser utilizados para tareas adicionales como crear bases de datos, enviar notificaciones, etc.

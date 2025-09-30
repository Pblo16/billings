---
applyTo: "**"
---
# Instrucciones para Laravel + Sail + Inertia (React)

## General
- Todo comando de Artisan o de npm/pnpm se debe ejecutar a través de **Sail**.
  - Ejemplo: `sail artisan migrate`, `sail artisan make:model`, `sail pnpm install`.
- Asumir que Sail ya está levantado con `sail up -d`.
- Para frontend usar siempre **pnpm** vía Sail: `sail pnpm dev`, `sail pnpm build`.

## Laravel
- Utilizar **Eloquent** y sus relaciones cuando sea posible.
- Seguir convenciones de Laravel para controladores (`app/Http/Controllers`), modelos (`app/Models`), migraciones y seeders.
- Validaciones siempre con **Form Requests**.
- Usar **Policies** para control de autorización.
- Los comandos de Artisan deben escribirse completos y en contexto de Sail.

## Inertia + React
- Los componentes de React deben ir en `resources/js/pages` para vistas completas y en `resources/js/components` para elementos compartidos.
- Usar **React functional components** con Hooks.
- Para formularios, preferir el hook `useForm` de Inertia.
- Mantener un layout principal en `resources/js/layouts` y heredar desde ahí.
- Navegación de páginas: `Inertia.link` o `Link` de `@inertiajs/react`.

## Estilo de código
- TypeScript opcional, pero preferido para componentes React nuevos.
- Estilos con **TailwindCSS** (ya integrado en la mayoría de setups Inertia).
- Mantener consistencia entre frontend y backend: nombres en inglés, camelCase en JS/TS, snake_case en base de datos.

## Testing
- Tests de backend: **Pest** o PHPUnit.
- Tests de frontend: **Vitest** + React Testing Library.
- Ejecutar siempre dentro de Sail: `sail test`, `sail pnpm test`.

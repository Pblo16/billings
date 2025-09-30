# Copilot Instructions for SGI (Laravel + Sail + Inertia)

## Architecture Overview
- **Backend:** Laravel (app/, routes/, database/) with Eloquent ORM, Form Requests for validation, and Policies for authorization.
- **Frontend:** Inertia.js + React (resources/js/), using functional components and hooks. Pages in `resources/js/pages`, shared components in `resources/js/components`, layouts in `resources/js/layouts`.
- **Dev Environment:** All commands (artisan, npm/pnpm) must run via Sail (Docker). Example: `sail artisan migrate`, `sail pnpm dev`.
- **Styling:** TailwindCSS is used for all frontend styles.

## Key Workflows
- **Start environment:** `sail up -d`
- **Run migrations:** `sail artisan migrate`
- **Install dependencies:** `sail pnpm install`
- **Build frontend:** `sail pnpm build`
- **Run tests:** Backend: `sail test` (Pest/PHPUnit), Frontend: `sail pnpm test` (Vitest + React Testing Library)

## Project Conventions
- **Controllers:** `app/Http/Controllers/` (RESTful, use Eloquent relationships)
- **Models:** `app/Models/`
- **Form Requests:** `app/Http/Requests/` (always use for validation)
- **Policies:** `app/Policies/` (authorization)
- **React Components:**
  - Pages: `resources/js/pages/`
  - Shared: `resources/js/components/`
  - Layouts: `resources/js/layouts/`
- **Naming:** English, camelCase for JS/TS, snake_case for DB
- **TypeScript:** Preferred for new React components

## Integration Points
- **Inertia:** Laravel controllers return Inertia responses to render React pages.
- **Frontend forms:** Use Inertia's `useForm` hook for state and submission.
- **Navigation:** Use `Link` from `@inertiajs/react` for SPA navigation.

## Examples
- To create a new model: `sail artisan make:model Example`
- To add a new React page: Place in `resources/js/pages/`, use functional component and TailwindCSS.
- To run backend tests: `sail test`
- To run frontend tests: `sail pnpm test`

## External Dependencies
- **Docker/Sail** for local dev
- **TailwindCSS** for styling
- **Vitest/React Testing Library** for frontend tests
- **Pest/PHPUnit** for backend tests

## References
- See `.github/instructions/Laravel Inertia.instructions.md` for detailed workflow and conventions.
- See `vite.config.ts` and `tsconfig.json` for frontend build config.
- See `compose.yaml` and `Dockerfile` for environment setup.

---
**Update this file as project conventions evolve.**

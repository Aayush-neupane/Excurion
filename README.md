# Excurion — Virtual Classroom

Frontend for a virtual classroom SaaS: landing page, auth, dashboard, live meeting room, whiteboard (tldraw), real-time chat, profile and settings.

## Stack

- React 19 + TypeScript + Vite 8 (rolldown)
- Tailwind CSS v4 (CSS-first config via `src/styles/index.css`)
- React Router, TanStack Query, Zustand (persist), Radix UI primitives, lucide-react
- tldraw for the whiteboard; Storybook for the design system

## Commands

```sh
npm run dev            # dev server (http://localhost:5173)
npm run build          # tsc -b && vite build
npm run preview        # preview the production build
npm run lint           # oxlint
npm run storybook      # design system (http://localhost:6006)
npm run build-storybook
```

## Design system

All visual tokens (color, typography, spacing, radius, elevation, motion, z-index) are centralized in `src/styles/index.css` and mapped to Tailwind utilities via `@theme inline`. tldraw theming lives in `src/styles/tldraw-dark.css`.

Reusable primitives in `src/components/ui/*` are built with CVA variants + `cn()` (tailwind-merge) and are covered by stories in `.storybook/`.

## Demo credentials

Instructor: `ava@excurion.app` / `password123`

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

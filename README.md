<div align="center" style="font-family: 'Inter', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;">

<img src="./src/assets/excurion.png" width="64" height="64" alt="Excurion mark" />

# EXCURION

**Virtual Classroom — live lessons, an infinite whiteboard, and real-time chat, all in the browser.**

Built for teachers, loved by students. No downloads, no extensions — classes run entirely in the browser
with automatic reconnection and a connection-quality indicator.

![React](https://img.shields.io/badge/React-19-3E84C8?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3E84C8?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-3E84C8?style=flat-square&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-3E84C8?style=flat-square&logo=tailwindcss)
![tldraw](https://img.shields.io/badge/whiteboard-tldraw-3E84C8?style=flat-square)
![Storybook](https://img.shields.io/badge/design_system-Storybook-3E84C8?style=flat-square&logo=storybook)

</div>

---

## What's inside

<div align="center" style="font-family: 'Inter', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;">

| Live lessons | Infinite whiteboard | Real-time chat | Recordings |
| :---: | :---: | :---: | :---: |
| Join with a link, video-first classrooms with quality indicators | tldraw-powered canvas with teacher-presented tools | Side-panel messaging while class runs | Every meeting ready to rewatch |

</div>

## Stack

| Layer | Choice |
| --- | --- |
| Framework | `React 19` + `TypeScript` + `Vite 8 (rolldown)` |
| Styling | `Tailwind CSS v4` — CSS-first tokens in `src/styles/index.css` |
| Routing & state | `React Router`, `TanStack Query`, `Zustand` (persisted), `Radix UI` primitives, `lucide-react` |
| Whiteboard | `tldraw`, themed dark in `src/styles/tldraw-dark.css` |
| Design system | `Storybook` at `localhost:6006` |

## Getting started

```sh
npm install
npm run dev            # dev server → http://localhost:5173
npm run build          # tsc -b && vite build
npm run preview        # preview the production build
npm run lint           # oxlint
npm run storybook      # component library → http://localhost:6006
```

## Demo credentials

| Role | Email | Password |
| --- | --- | --- |
| Instructor | `ava@excurion.app` | `password123` |

## Design system

All visual tokens — color, typography, spacing, radius, elevation, motion, z-index — are centralized
in `src/styles/index.css` and mapped to Tailwind utilities via `@theme inline`. Reusable primitives
live in `src/components/ui/*` (CVA variants + `cn()` tailwind-merge) and are covered by stories in `.storybook/`.

The brand typeface is **Inter Variable**, used across the product with the EXCURION wordmark set in
extrabold weight with wide tracking.

## Project structure

```
src/
├── app/            # router, providers
├── api/            # mock API layer
├── assets/         # brand mark (excurion.png)
├── components/     # Logo + ui primitives
├── features/
│   ├── auth/       # login & register
│   ├── dashboard/  # stats, recent classes, upcoming meetings
│   ├── landing/    # marketing site
│   ├── meeting/    # live room, participants, chat
│   ├── settings/   # profile, theme, accessibility
│   └── whiteboard/ # tldraw canvas
├── layouts/        # AppLayout, AuthLayout
├── lib/            # utils
├── store/          # zustand stores
└── styles/         # tokens, tldraw dark theme
```

---

<div align="center" style="font-family: 'Inter', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; color: #666;">

**EXCURION** — virtual classroom platform · © 2026 Excurion Labs, Inc.

</div>
# Frontend

## Overview

The Savepoint web client. A Next.js App Router application that renders the game
library, social features, and stats, and talks to the NestJS backend through a
centralized API client.

---

## Tech Stack

- **Next.js** (App Router) & **React**
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (Radix UI primitives, `radix-nova` style)
- **NextAuth v5 / Auth.js** (credentials provider)
- **Recharts** (charts)
- **lucide-react** (icons)
- **sonner** (toasts)
- **next-themes** (light/dark theme)
- **@vercel/og** (generated share images)

---

## Folder Structure

```
frontend/
├── public/
└── src/
    ├── app/
    │   ├── (app)/            # Authenticated app routes
    │   ├── actions/          # Server actions
    │   ├── api/              # Route handlers (NextAuth, OG image)
    │   ├── login/
    │   ├── register/
    │   ├── layout.tsx
    │   ├── providers.tsx
    │   └── globals.css
    ├── auth.ts               # NextAuth configuration
    ├── components/
    │   └── ui/               # shadcn/ui components
    ├── lib/
    │   ├── api-client.ts     # Backend API client + shared types
    │   └── utils.ts
    └── types/
```

---

## Architecture

- **App Router**: routes live under `src/app`. Authenticated screens are grouped in the `(app)` route group.
- **Pages**: each route's `page.tsx` is a Server Component that loads the session and fetches initial data.
- **Client components**: interactive UI lives in `*-client.tsx` files marked `"use client"`.
- **Layouts**: `app/layout.tsx` (root) and `app/(app)/layout.tsx` (authenticated shell).
- **Services / API layer**: all backend calls go through `src/lib/api-client.ts`.
- **DTOs / types**: request/response shapes are defined as TypeScript interfaces in `api-client.ts` and `src/types`.
- **Hooks**: TODO: no shared `hooks/` directory currently exists.
- **State management**: React state, server state (Server Components), and the NextAuth session. No global state library is used.
- **UI library**: shadcn/ui built on Radix UI primitives.
- **Forms**: native forms submitted via server actions with server-side validation.
- **Validation**: handled server-side (in server actions and by the backend); no client-side schema library is used.

---

## Project Structure

| Folder | Purpose |
| --- | --- |
| `app/(app)` | Authenticated feature routes (home, library, games, lists, diary, friends, stats, settings). |
| `app/actions` | Server actions (e.g. registration). |
| `app/api` | Route handlers for NextAuth and Open Graph image generation. |
| `components` | Shared React components. |
| `components/ui` | shadcn/ui primitives. |
| `lib` | API client and utilities. |
| `types` | Shared type declarations. |

---

## Authentication Flow

- Sign-in uses the NextAuth **credentials** provider (`src/auth.ts`).
- On login, credentials are posted to the backend `/auth/login`; the returned JWT access token is stored in the NextAuth session.
- Registration is handled by a server action that calls the backend `/auth/register`, then signs the user in.
- The session uses the JWT strategy; the backend access token is attached to the session and forwarded on API requests.
- Unauthenticated users are redirected to `/login`.

---

## API Communication

- All requests go through the client in `src/lib/api-client.ts`.
- The base URL is read from `NEXT_PUBLIC_API_URL` (client) / `API_URL` (server).
- Requests attach the session's JWT as a `Bearer` token.
- Errors are normalized into thrown `Error`s with backend-provided messages.
- Shared response types are exported from the same module.

---

## Styling

- **Tailwind CSS v4**: configured via `@tailwindcss/postcss`; global styles in `src/app/globals.css`.
- **shadcn/ui**: components generated per `components.json` (`radix-nova` style, `neutral` base color, CSS variables).
- **Theming**: light/dark handled by `next-themes`.

---

## Environment Variables

| Variable | Description |
| --- | --- |
| `AUTH_SECRET` | Secret used by NextAuth to sign/encrypt session tokens. |
| `NEXTAUTH_URL` | Base URL of the frontend (e.g. `http://localhost:3000`). |
| `API_URL` | Backend base URL used in server-side code. |
| `NEXT_PUBLIC_API_URL` | Backend base URL exposed to the browser. |

See `.env.local.example` for a template.

---

## Getting Started

### Installation

```bash
npm install
```

### Running locally

Create `.env.local` from the example, then start the dev server:

```bash
cp .env.local.example .env.local
npm run dev
```

The app runs at `http://localhost:3000` and expects the backend at `http://localhost:3001`.

### Development mode

```bash
npm run dev
```

### Production build

```bash
npm run build
npm run start
```

---

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |

---

## Coding Guidelines

- **Components**: `PascalCase` names; interactive components in `*-client.tsx` marked `"use client"`.
- **Server Components**: default; use Client Components only when browser APIs, state, or events are required.
- **Services**: all backend access through `src/lib/api-client.ts`; do not call the backend directly from components.
- **DTOs / types**: define request/response types alongside the API client or in `src/types`.
- **File organization**: feature routes under `app/(app)`; shared UI in `components`.
- **Import ordering**: Node → external packages → internal aliases (`@/…`) → relative → types.

---

## Build

```bash
npm run build
```

Outputs an optimized production build to `.next`.

---

## Deployment

TODO: Document the deployment target and process. Ensure all environment
variables above are set and `NEXT_PUBLIC_API_URL` / `API_URL` point to the
deployed backend.

---

## Troubleshooting

- **Requests fail / 401**: confirm `API_URL` and `NEXT_PUBLIC_API_URL` point to a running backend and that you are signed in.
- **Login always fails**: ensure the backend is reachable and `AUTH_SECRET` is set.
- **CORS errors**: the backend must allow the frontend origin (`FRONTEND_URL` on the backend).
- **Images not loading**: game covers are served from external CDNs (RAWG/Steam); check network access.
- **Env changes not applied**: restart the dev server after editing `.env.local`.

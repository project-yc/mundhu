# TruDev Frontend — Agent Instructions

## What This Repo Is

React 19 single-page application for the TruDev assessment platform. Serves three user types: recruiter/admin dashboard (B2B), candidate assessment flow (B2C), and candidate user pages (B2C practice/analytics).

**Stack**: React 19 + Vite 7 + Tailwind CSS 3 + Radix UI + React Router 7 + Axios

## Directory Structure

```
frontend/src/
├── api/                     # API call modules by domain
│   ├── recruiter/           # Assessment CRUD, pipeline, invites, reports
│   ├── candidate/           # Candidate runtime (session, MCQ)
│   ├── auth/                # Login, signup
│   ├── ai-report/           # AI analytics reports
│   ├── admin/               # Admin library management
│   └── org/                 # Organization branding
├── pages/                   # Page components
│   ├── recruiter/           # B2B: dashboard, assessments, pipeline, reports, candidates
│   ├── candidate/           # B2C assessment flow (landing, runtime, MCQ, completion)
│   ├── auth/                # Login, signup, waitlist
│   └── admin/               # Admin dashboard, library
├── users/                   # B2C candidate self-serve pages (sub-app)
│   ├── pages/               # Dashboard, simulations, sessions, analytics, settings
│   ├── components/          # Report visualization widgets, layout
│   ├── hooks/               # useUserDashboard, useUserSimulations
│   └── services/            # API service layer
├── components/              # Shared presentational components
│   ├── ui/                  # shadcn/ui primitives (Button, Input, Badge, Tabs, Table, etc.)
│   ├── candidate/           # Candidate-facing components
│   ├── recruiter/           # Recruiter components
│   └── particles/           # WebGL particle background
├── theme/                   # Theming system (palette, brand derivation, providers)
├── lib/
│   ├── axios.js             # Axios instance with auth interceptors + 401 refresh
│   └── utils.js             # cn() — clsx + tailwind-merge
└── utils/
    ├── ProtectedRoute.jsx   # Role-based route guard
    ├── AdminRoute.jsx       # Admin-only route guard
    ├── authFetch.js         # Native fetch with auth + refresh logic
    └── pagination.js
```

## Conventions

### Components
- **Functional components only** — no class components
- Plain JavaScript (JSX) — **no TypeScript** (despite `@types/react` in devDeps for IDE support)
- Exports: mix of default and named, no strict pattern
- Props: destructured in function signatures, no PropTypes

### State Management
- **No global state library** — local `useState` + `useEffect` only
- **localStorage**: `authToken`, `refreshToken`, `user`, `org`, `userRole`
- **sessionStorage**: candidate assessment state (`trudev_mcq_session`, `trudev_candidate_branding`)
- One React Context: `RecruiterThemeProvider` for theming only
- Custom hooks in `users/hooks/` follow `useXxx` pattern

### API Calls
- **Two HTTP clients coexist**:
  - **Axios** (`lib/axios.js`): Auto-unwraps `response.data`, injects `Authorization` header, silent 401 refresh with queueing. Used by recruiter/admin/org API modules.
  - **Native fetch** (`utils/authFetch.js`): Same auth + refresh logic. Used by some candidate/auth modules.
- API modules imported from `../../api/<domain>/<module>`
- Endpoint pattern: mixed `/api/v1/...` and `/api/...` — check the OpenAPI spec

### Styling
- **Tailwind CSS v3** primary — no CSS modules or styled-components
- Semantic CSS variable tokens: `bg-page`, `text-text-primary`, `bg-brand`, `border-border-default` etc.
- `@layer components` in `index.css` defines reusable patterns (`.btn-primary`, `.card-surface`, etc.)
- shadcn/ui primitives use `cva` for variant management + `cn()` for merging
- Icons: **Lucide** (primary, recruiter/admin), **Tabler** (secondary, candidate pages)

### Routing
- React Router v7, flat route structure in `App.jsx`
- Protected routes: `<ProtectedRoute requiredRole="RECRUITER">` or `"USER"`
- Admin routes: `<AdminRoute>` (strict ADMIN check)
- Recruiter routes wrapped in `<RecruiterLayout>` (persistent sidebar + theme)
- Candidate routes are public (auth via invite token in URL)

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `react` ^19, `react-dom` ^19 | UI framework |
| `react-router-dom` ^7 | Routing |
| `axios` ^1.13 | HTTP client (with interceptors) |
| `tailwindcss` ^3.4 | Utility-first CSS |
| `lucide-react` ^0.562 | Primary icons |
| `@radix-ui/react-*` | Headless UI primitives |
| `@dnd-kit/*` | Drag and drop |
| `ogl` ^1.0 | WebGL particle animation |

## Build & Run

```bash
cd frontend
npm install
npm run dev           # Dev server (Vite, default port 5173)
npm run build         # Production build
npm run lint          # ESLint

# Proxy: /api → VITE_PROXY_TARGET (default http://3.81.72.164)
# Deployment: Vercel with vercel.json rewrites
```

## Cross-Repo Dependencies

- Consumes Django backend REST API (all endpoints)
- Backend URL: proxied through Vite dev server or Vercel in production
- OpenAPI spec: `../docs/api-schema.yaml`
- Auth: JWT tokens from `POST /api/auth/v1/login`, stored in localStorage

## Off-Limits (Do Not Read These)

- `node_modules/`, `dist/`, `graphify-out/`
- `public/` (static assets only)
- `scripts/` (build/deploy utilities)

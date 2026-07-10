# team1-frontend

A Node.js/Express frontend UI that renders job role data from a backend API
using Nunjucks templates.

## Prerequisites

- Node.js (v20+)
- npm

## Environment setup

Copy `.env.example` to `.env` and update the values for your environment:

```bash
cp .env.example .env
```

---

## UI application

### Install dependencies

```bash
npm install
```

### Run (development)

Starts the UI with live reload via `tsx watch`:

```bash
npm run dev
```

The app will be available at <http://localhost:4000>.

### Run (production)

Build first, then start the compiled output:

```bash
npm run build
npm start
```

### Build

Compiles TypeScript and copies Nunjucks views to `dist/`:

```bash
npm run build
```

### Test

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with the Vitest UI
npm run test:ui
```

### Git hooks

After cloning the repo, run this once to activate the pre-commit lint hook:

```bash
git config core.hooksPath .githooks
```

The hook runs `lint:fix` automatically before every commit, and aborts if there are errors that cannot be auto-fixed.

### Lint

```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run lint:fix

# CI lint check (no auto-fix, stricter output)
npm run ci:check
```

---

## Backend API connection

This frontend expects a backend API to be running and reachable via `API_BASE_URL`.

Set `API_BASE_URL` in your `.env` to the backend URL (for example
`http://localhost:3000` if your backend runs locally on port 3000).

If no backend is running, job-role pages will fail to load data.

---

## Database migrations

Database migrations are managed in the **backend API repository**, not this
frontend project. Refer to the backend API README for migration instructions.

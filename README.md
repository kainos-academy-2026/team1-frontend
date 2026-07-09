# team1-frontend

A Node.js/Express frontend UI that renders job role data from a backend API using Nunjucks templates.

## Prerequisites

- Node.js (v20+)
- npm

## Environment setup

Copy `.env.example` to `.env` and update the values for your environment:

~~~bash
cp .env.example .env
~~~

---

## UI application

### Install dependencies

    npm install

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

## Mock API

A local mock of the backend API is included at `mock-api.ts`. Use this when you don't have a real backend running.

### Run

```bash
npx tsx mock-api.ts
```

The mock API starts on port 3000 and exposes:

| Endpoint | Description |
|---|---|
| `GET /job-roles` | List all job roles |

Set `API_BASE_URL=http://localhost:3000` in your `.env` to point the UI at the mock API.

---

## Database migrations

Database migrations are managed in the **backend API repository**, not this frontend project. Refer to the backend API README for migration instructions.


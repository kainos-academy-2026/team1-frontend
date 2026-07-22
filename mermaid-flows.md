# Testing Workflows

This file documents the current automated testing workflows configured in this repository.

## End-to-end Framework Test Workflow

```mermaid
flowchart TD
    A[Start: npm run test:framework] --> B[npm run test]
    B --> C[Vitest runs unit and integration tests]
    C --> D{Vitest passing?}
    D -- No --> X[Stop and return failing status]
    D -- Yes --> E[npm run test:bdd]
    E --> F[Set JWT_SECRET and API_BASE_URL defaults for BDD]
    F --> G[Cucumber runs feature files with step definitions]
    G --> H[Write Cucumber JSON report to test-reports]
    H --> I{BDD passing?}
    I -- No --> X
    I -- Yes --> J[npm run test:ui:e2e]
    J --> K[Playwright starts webServer: build and start app]
    K --> L[Resolve UI base URL from TEST_ENV settings]
    L --> M[Run e2e checks in chromium and edge]
    M --> N[Run Axe accessibility checks and page assertions]
    N --> O[Write Playwright HTML and JSON reports]
    O --> P{Playwright passing?}
    P -- No --> X
    P -- Yes --> Y[Framework suite passes]
```

## Test Environment URL Resolution Workflow

```mermaid
flowchart LR
    A[Read TEST_ENV or default local] --> B{Supported environment?}
    B -- No --> C[Throw Unsupported TEST_ENV error]
    B -- Yes --> D[Build environment specific UI or API base URL key]
    D --> E{Configured value present?}
    E -- Yes --> F[Use configured URL]
    E -- No --> G{Default URL available?}
    G -- Yes --> H[Use local default URL]
    G -- No --> I[Throw missing base URL error]
```

## Frontend Application Workflows

These diagrams describe the user-facing workflows in the application. Use them to identify flows to cover with Playwright e2e tests.

### Authentication Workflow

```mermaid
flowchart TD
    A[User visits any protected route] --> B{Token cookie present and valid?}
    B -- No --> C[Redirect to /auth/login]
    B -- Yes, wrong role --> D[403 Forbidden page]
    B -- Yes, correct role --> E[Proceed to route handler]

    C --> F[GET /auth/login — render login page]
    F --> G[User submits email and password]
    G --> H{Validation passes?}
    H -- No --> I[Re-render login.njk with field errors]
    H -- Yes --> J[POST /auth/login — call login service]
    J --> K{Login API response?}
    K -- Failure --> L[Re-render login.njk with login error message]
    K -- Success --> M[Set token cookie]
    M --> N[Redirect to /]

    N2[POST /auth/logout] --> O[Clear token cookie]
    O --> P[Redirect to /auth/login?loggedOut=1]
    P --> Q[Render login page with logout success message]
```

### Registration Workflow

```mermaid
flowchart TD
    A[GET /registration] --> B[Render registration.njk]
    B --> C[User submits email and password]
    C --> D{Validation passes?}
    D -- No --> E[400 — re-render registration.njk with field errors]
    D -- Yes --> F[POST /registration — call createUser service]
    F --> G{API response}
    G -- 409 Conflict --> H[Re-render with email already in use error]
    G -- 400 Bad Request --> I[Re-render with field-level API errors]
    G -- 500 or other --> J[Pass to error handler]
    G -- Success --> K[Redirect to /]
```

### Job Roles Workflow

```mermaid
flowchart TD
    A[GET /job-roles] --> B{Authorised? Admin or User role}
    B -- No --> C[Redirect to /auth/login]
    B -- Yes --> D[Fetch paginated job roles from API]
    D --> E[Filter to open roles only]
    E --> F[Render job-role-list.njk with pagination]

    F --> G[User clicks a role]
    G --> H[GET /job-roles/:id]
    H --> I{Authorised? Admin or User role}
    I -- No --> C
    I -- Yes --> J{Job role found?}
    J -- No --> K[Render 404 Job Role Not Found error page]
    J -- Yes --> L[Render job-role-information.njk]
```

### Application Workflow

```mermaid
flowchart TD
    A[GET /job-roles/:id/apply] --> B{Authorised? User role only}
    B -- No --> C[Redirect to /auth/login or 403 Forbidden]
    B -- Yes --> D{Job role found?}
    D -- No --> E[404 error page]
    D -- Yes --> F{Role open and has open positions?}
    F -- No --> G[409 Role not available error page]
    F -- Yes --> H[Render apply.njk]

    H --> I[User submits fileName and contentType]
    I --> J[POST /job-roles/:id/apply]
    J --> K{API response}
    K -- 404 --> L[200 JSON: job role not found]
    K -- 409 --> M[200 JSON: role not open for applications]
    K -- 400 --> N[200 JSON: invalid application request]
    K -- Success --> O[200 JSON: presigned upload URL result]
```

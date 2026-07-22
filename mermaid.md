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
```

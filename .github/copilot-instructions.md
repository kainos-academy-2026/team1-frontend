Use these instructions in every chat/session and confirm that they are being used clearly to the user in each chat.

## SOLID Principles

Apply the five SOLID principles for clean, maintainable code:

- **Single Responsibility (SRP)** — Each class/function has one reason to change. Use dependency injection to separate concerns (e.g., `UserService` should not handle persistence, email, *and* logging).
- **Open/Closed (OCP)** — Open for extension, closed for modification. Add new features via new classes/interfaces, not by changing existing code.
- **Liskov Substitution (LSP)** — Subtypes must be safely substitutable for their base types. Model capabilities via interfaces, not hierarchy.
- **Interface Segregation (ISP)** — Clients should not depend on interfaces they don't use. Keep interfaces small and focused; don't force unnecessary methods.
- **Dependency Inversion (DIP)** — Depend on abstractions, not concrete implementations. Inject dependencies via constructors; always program to interfaces.

## Data Flow And Layer Responsibilities

Data flows unidirectionally from the request boundary inward:

1. **Router** — Thin routing layer. Attach validation middleware here; define routes only.
2. **Validation Middleware** — Parse and validate `req.body` and `req.params` using Zod schemas. On success, replace `req.body` with validated, typed data and call `next()`. On failure, respond with `400` and structured errors.
3. **Controller** — HTTP layer only. Parse validated input, call service methods, map responses to DTOs, return appropriate status codes. Never contain business logic.
4. **Service** — Business logic and data access. Query repositories/models, apply business rules, throw meaningful errors (never silent catches).
5. **Models/Database** — Domain representation and persistence. Keep models free of HTTP concerns.

Validation belongs at the boundary (middleware layer), not in controllers or services. Trust all data that reaches the service.

## Scope Of Changes
- Make the smallest safe change that solves the issue.
- Preserve existing naming, file structure, and public interfaces unless a change is required.
- Do not refactor unrelated areas while fixing a focused bug.

## TypeScript Syntax And Type Safety
- Use explicit, strict types for function inputs and outputs.
- Prefer interfaces and named types for DTOs and domain models.
- Avoid type assertions unless there is no safer option.
- Handle null and undefined cases intentionally.
- Keep functions small and single-purpose.
- Never use 'Omit' or 'any' types.
- Avoid `unknown` in application-layer function signatures; only use it at explicit trust boundaries (for example raw external payload parsing) and narrow immediately with runtime checks or schema validation.

## MVC Structure Rules
- Keep routers thin: define routes and attach middleware only.
- Keep controllers focused on HTTP concerns: parse input, call services, return responses.
- Keep business logic in services, not controllers or routers.
- Keep models as domain representations and DTOs as API contract shapes.
- Keep mappers as class-based translators between DTOs, models, and view models.
- Keep views/presentation templates free of business logic.
- Ensure files are responsible for ONE thing at a time; create new files for new responsibilities.
- Separate concerns into separate files. Do not define route-specific schemas, validation middleware, or view-model rendering helpers inline in router files.

## File Separation Rules

- Place Zod schemas and DTO types in model files.
- Place interfaces in dedicated files by responsibility (avoid grouping unrelated interfaces in one file).
- Place validation logic in middleware files.
- Place error-page rendering helpers in error or middleware files.
- Router files should only compose dependencies and declare routes/middleware chains.
- For server-rendered forms, pass transient validation/API error state via `res.locals` instead of expanding view model interfaces.

## Nunjucks Reuse Pattern

- For repeated UI blocks in templates (for example input + hint + error + feedback), use a reusable Nunjucks macro or include partial instead of duplicating markup.
- Keep page templates focused on layout and composition; move repeated field rendering into a dedicated template file in the views layer.
- Pass only explicit input data into macros (id, name, label, type, value, hintId, hintText, feedbackId, error message, extra attributes).
- Keep validation and business rules out of templates; macros should only render presentation concerns.
- Preserve accessibility defaults in reusable fields (matching label/for, aria-describedby, and aria-live feedback where needed).

## Frontend Asset Rules

- Do not use inline CSS in templates. Put styling in external CSS files under `assets/`.
- Do not use inline JavaScript in templates. Put behavior in external JavaScript files under `assets/` and reference them from templates.
- Keep templates declarative and focused on markup/content; keep presentation and behavior in asset files.
- When Zod validation and server-rendered field errors already satisfy requirements, do not add extra client-side validation JavaScript.

## Router and App Configuration

- **Router files** — The composition root for a route group. Instantiate all services, controllers, and mapper classes here, inject them via constructors, then declare routes as a flat list of statements. Export the router as a plain default export (no factory functions). Example:

```typescript
// src/routers/jobRoleRouter.ts
import axios from "axios";
import { Router } from "express";
import { requireApiBaseUrl } from "../config/requireApiBaseUrl.js";
import { JobRoleController } from "../controllers/jobRoleController.js";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";
import { ApiJobRoleService } from "../services/apiJobRoleService.js";
import { validateBody } from "../middleware/validate.js";
import { CreateJobRoleSchema } from "../models/jobRoleDto.js";

const apiBaseUrl = requireApiBaseUrl();
const mapper = new JobRoleMapper();
const service = new ApiJobRoleService(axios, apiBaseUrl, mapper);
const controller = new JobRoleController(service);
const router = Router();

router.get("/", (req, res) => controller.getAll(req, res));
router.post("/", validateBody(CreateJobRoleSchema), (req, res) => controller.create(req, res));

export default router;
```

- **Axios API client pattern** — Create a single Axios instance configured with `baseURL` (for example via a shared `createApiHttpClient()` function in `src/config/`) and inject that instance into API-facing services. Do not pass `apiBaseUrl` strings into services. In services, call relative paths only (for example `/auth/login`, `/auth/signup`, `/job-roles`). Keep URL composition out of service methods.

- **app.ts** — Contains only `app.` statements: middleware setup, router mounting, and error handlers. No service, controller, or mapper instantiation. Import routers as plain default imports and mount them directly. Example:

```typescript
// src/app.ts
import express from "express";
import jobRoleRouter from "./routers/jobRoleRouter.js";
import { errorHandler } from "./errors/errorHandler.js";

const app = express();

app.use(express.json());
app.use("/api/job-roles", jobRoleRouter);
app.use(errorHandler);

export default app;
```

## Error Handling
- Use centralized error handling patterns already present in the project.
- Throw meaningful errors from services and map them to user-facing responses in controllers/error handlers.
- Do not swallow errors silently.
- Prefer predictable error messages and consistent status codes.

## Debugging Workflow
- Reproduce the problem first with a clear failing path (test or manual steps).
- Read the full error and stack trace before editing code.
- Fix root causes, not symptoms.
- Add or update tests to prevent regression when practical.
- Re-run relevant checks after changes (tests, type checks, linting if configured).

## Readability And Maintainability
- Use descriptive names for variables, functions, and classes.
- Avoid deeply nested conditionals; extract helper functions when logic grows.
- Keep side effects explicit and localized.
- Add brief comments only where intent is not obvious from code.

## Data Flow And Mapping
- Validate inbound request data before it reaches business logic.
- Keep API DTOs separate from domain models.
- Use dedicated mapper classes for transformations instead of inline object reshaping across layers.

## Validation Middleware Pattern

- **Always use Zod** for validation. Define schemas as the single source of truth for both runtime validation and TypeScript types.
- **Validation at the boundary** — attach `validateBody(schema)` and `validateParams(schema)` middleware in the router before controller handlers.
- **Use `safeParse` always** — never `parse`. Return `400` with structured errors in this shape:

```typescript
{ errors: [{ field: string; message: string }] }
```

- **Define schemas alongside DTOs** — keep schema and DTO type together in the models directory, so changes stay in sync.
- **Reusable middleware shape** — implement validation middleware with `RequestHandler` and `ZodSchema`, including a shared `toErrors(...)` mapper.
- **Mutation on success** — overwrite `req.body` / `req.params` with validated values, then call `next()`.
- **Controllers are HTTP-only** — do not parse or validate in controllers when validation middleware is available.

## Change Verification Checklist

After making any code change, ensure quality by running:

- **`npm run lint`** — verify code style and no linting errors.
- **`npm run test`** — run all unit tests and verify they pass.
- **`npm run build`** — verify the build completes without errors.

## Testing Expectations

- **Target 100% code coverage** where possible. Run tests with coverage reporting.
- **If 100% coverage cannot be achieved**, manually document and flag in code comments why specific code paths cannot be tested (e.g., unreachable error handlers, environment-specific branches).
- **Prefer unit tests** for service logic, mappers, and business rules.
- **Test controller behavior** around success paths, validation failures, and service errors.
- **Keep test names** behavior-focused and deterministic.
- **Test validation** at the middleware and controller boundary to ensure error formatting is correct.
- Do not rely on coverage percentage alone — ensure critical paths have meaningful assertions.

Update the README file after changes are made, if appropriate.
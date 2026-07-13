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

## MVC Structure Rules
- Keep routers thin: define routes and attach middleware only.
- Keep controllers focused on HTTP concerns: parse input, call services, return responses.
- Keep business logic in services, not controllers or routers.
- Keep models as domain representations and DTOs as API contract shapes.
- Keep mappers as class-based translators between DTOs, models, and view models.
- Keep views/presentation templates free of business logic.

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

## Testing Expectations
- Prefer unit tests for service logic and mapper behavior.
- Test controller behavior around success, validation failure, and service errors.
- Keep test names behavior-focused and deterministic.

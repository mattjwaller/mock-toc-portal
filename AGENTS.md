# Repository Guidelines

These rules govern contributions in this repository.

## Coding Standards

- All code should be written in **TypeScript** and placed under `src/`.
- Use **Express** for the API layer and **Prisma** for database access.
- Zod should be used for payload validation.
- Keep indentation at two spaces and prefer `async/await` over callbacks.
- When adding types or functions, keep them strongly typed and avoid `any`.

## Environment & Tools

- Node.js 20 is the expected runtime.
- Linting is performed with ESLint via `npm run lint`.
- Compile checks should pass with `npx tsc --noEmit`.

## Commit Messages

- Summarize the change in the first line.
- Do not amend or force push existing commits.

## Testing

Run the following after code changes and before committing:

```bash
npx tsc --noEmit
```

Additional test commands may be added in the future.

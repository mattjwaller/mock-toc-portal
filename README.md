# mock-toc-portal

This project is a simplified reference implementation of the Incident & Ticketing Portal described in `implementation.md`. It exposes a REST API using Express and persists data with PostgreSQL via Prisma.

## Development

Install dependencies and generate the Prisma client:

```bash
npm ci
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

Seed demo data into the database:

```bash
npm run seed
```

Lint and type check the project:

```bash
npm run lint
npm run test:ci
```

Environment variables are documented in `.env.example`.

The service exposes `/healthz` for health checks and `/metrics` for Prometheus-compatible metrics. Requests are logged in JSON for easy aggregation.

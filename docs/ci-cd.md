# CI/CD, Docker and Sonar

Covers PRD section 13 (FR-24, SonarQube) and section 15 (CI/CD). Status: the
workflows and images were written and statically checked, but **never executed
on GitHub or in Docker** (see "What has and has not been verified").

## Pipeline

```
feature/* ──PR──▶ develop ──PR──▶ main
                    │              │
   ci.yml (pull_request + push to develop/main)
   ┌───────────────┬──────────────┬────────────┬─────────────────────┐
   │ quality       │ collab-server│ build      │ e2e                 │
   │ lint          │ npm ci       │ next build │ postgres service    │
   │ type-check    │ type-check   │ (cached)   │ prisma db push      │
   │ unit tests +  │ tsc build    │            │ playwright (CI=true)│
   │ coverage ─────┼──────────────┼────────────┼─ report on failure  │
   └──────┬────────┘              │            │                     │
          ▼ coverage artifact
        sonar  (skipped cleanly without SONAR_TOKEN / on fork PRs)
          scan + quality gate wait

   cd.yml (push to main + manual dispatch)
   images ──▶ deploy (environment: production)
   GHCR: <repo>-app, <repo>-app-tools, <repo>-collab   SSH + docker compose
   tags: <sha>, latest                                  (skipped w/o DEPLOY_*)
```

## Secrets and variables

Set under Settings > Secrets and variables > Actions. Nothing is required for CI
to be green; unset items skip the corresponding step.

| Name | Kind | Used by | Required | Purpose |
| --- | --- | --- | --- | --- |
| `SONAR_TOKEN` | secret | ci `sonar` | optional | Enables Sonar. Unset (or fork PR) = job skips with a notice |
| `SONAR_HOST_URL` | variable | ci `sonar` | SonarQube Server only | e.g. `https://sonar.example.com`; leave unset for SonarQube Cloud |
| `SONAR_PROJECT_KEY` | variable | ci `sonar` | optional | Defaults to the repository name |
| `SONAR_ORGANIZATION` | variable | ci `sonar` | SonarQube Cloud only | Organization key |
| `NEXT_PUBLIC_COLLAB_WS_URL` | variable | cd `images` | recommended | Public `ws(s)://` URL of the collab server. Inlined into the client bundle at build time |
| `SENTRY_AUTH_TOKEN` | secret | cd `images` | optional | Source-map upload (passed as a BuildKit secret) |
| `SENTRY_ORG`, `SENTRY_PROJECT` | variables | cd `images` | optional | Sentry upload target |
| `DEPLOY_HOST` | secret | cd `deploy` | for deploy | SSH host |
| `DEPLOY_USER` | secret | cd `deploy` | for deploy | SSH user (must be able to run docker) |
| `DEPLOY_SSH_KEY` | secret | cd `deploy` | for deploy | Private key |
| `DEPLOY_PATH` | variable | cd `deploy` | for deploy | Directory on the host holding `.env` and the compose file |
| `DEPLOY_SSH_PORT` | secret | cd `deploy` | optional | Default 22 |
| `DEPLOY_KNOWN_HOSTS` | secret | cd `deploy` | recommended | `ssh-keyscan` output, to pin the host key (otherwise trust on first use, with a warning) |
| `GHCR_PULL_TOKEN` | secret | cd `deploy` | if images are private | PAT with `read:packages` for the host to pull |

Also create the GitHub Environment `production` (add required reviewers).
Workflow `GITHUB_TOKEN` pushes to GHCR; no PAT is needed for that.

CI-only values (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `CI`,
`AUTH_TRUST_HOST`) are non-secret placeholders in `ci.yml`.

## E2E in CI

`CI=true` makes `playwright.config.ts` start `npm run dev` (Next on 3000 and
the collab server on 1234) against the postgres service, 1 worker, 2 retries.
Stripe, OAuth, SMTP and Sentry are unconfigured; no spec is excluded
(`billing.spec.ts` seeds subscriptions in the database; `password-reset.spec.ts`
reads the dev-only reset link, which is why e2e uses the dev server).

## Sonar

`sonar-project.properties` defines sources, tests, exclusions and
`sonar.javascript.lcov.reportPaths=coverage/lcov.info`. The job downloads the
`coverage` artifact from `quality` (produced by `npm run test:coverage`) and
runs `SonarSource/sonarqube-scan-action` with `sonar.qualitygate.wait=true`.
It covers code smells, security hotspots/vulnerabilities and coverage.

## Docker images

- `Dockerfile` (repo root): stages `deps`, `builder`, `tools`, `runner`.
  `runner` is `output: "standalone"`, non-root (`node`), has a HEALTHCHECK
  (`GET /login`) and `VOLUME /app/storage`.
- `server/Dockerfile`: collab server (`tsc` build, prod deps only, HEALTHCHECK `/health`).
- `NEXT_PUBLIC_COLLAB_WS_URL` is a **build arg** (inlined into the browser
  bundle). It must be the address the browser uses, not the compose service name.
- `src/lib/env.ts` has no skip switch, so the builder stage sets placeholder
  `DATABASE_URL` / `AUTH_SECRET`. They do not reach the runner image.
- **Uploads**: avatars are written to `./storage/uploads` at runtime. Mount a
  persistent volume at `/app/storage` (compose does: named volume `uploads`),
  otherwise uploads vanish on redeploy.
- **Auth.js** in production rejects unknown hosts (`UntrustedHost`): the
  containers set `AUTH_TRUST_HOST=true`; set `APP_URL` for email links.
- **Schema**: `prisma/migrations` is behind `schema.prisma` (8 of 14 tables), so
  the stack uses `prisma db push` (the one-shot `migrate` service, image target
  `tools`). Switch to `prisma migrate deploy` once migrations are regenerated.

### Run locally

```bash
cp .env.example .env        # set AUTH_SECRET; DATABASE_URL in .env is ignored by compose
docker compose up --build   # app :3000, collab :1234, postgres internal
```

Optional compose variables: `APP_PORT`, `COLLAB_PORT`, `POSTGRES_*`,
`NEXT_PUBLIC_COLLAB_WS_URL`, `COLLAB_CORS_ORIGIN` (restrict it in production).

### Deploy host prerequisites

Docker + compose plugin; `$DEPLOY_PATH/.env` with `AUTH_SECRET`, `APP_URL`,
`POSTGRES_PASSWORD` and any optional integrations; a TLS reverse proxy in front
of ports 3000 and 1234 (the browser needs `wss://`). The deploy job copies
`docker-compose.yml`, then runs `docker compose pull && up -d` with `APP_IMAGE`,
`COLLAB_IMAGE`, `APP_TAG` set to the pushed sha images.

## Recommended branch protection

For `develop` and `main`: require PRs, require status checks `Lint, type-check,
unit tests`, `Collab server build`, `Next.js build`, `Playwright e2e` (and
`Sonar analysis` once configured), require branches up to date, block force
pushes. `main`: also require a review and restrict who can push.

## What has and has not been verified

Verified locally: `next build` with `output: "standalone"`; the standalone
`server.js` serves pages on a custom port with `.next/static` copied; the collab
server builds and starts from `dist/`; workflow YAML parses and passes
`action-validator` schema checks; type-check and eslint pass.

Not verified: any Docker build or run (no Docker available), any workflow
execution on GitHub (including expression evaluation, caches, GHCR push, SSH
deploy), a real Sonar scan, and `npm run test:coverage` (provided by a parallel
Jest change). Action versions were chosen without checking each release tag;
confirm them (Dependabot for `github-actions` is a good idea).

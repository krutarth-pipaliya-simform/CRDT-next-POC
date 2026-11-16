# Headless CMS setup (Strapi v5)

Converge reads its blog, product announcements, documentation and release notes
from a headless CMS over Strapi v5's REST Content API. This folder holds the
content-type definitions and the setup steps. It is **not** a Strapi project:
nothing here is installed or run by the app.

> Status: verified against the fixture server in `e2e/fixtures/cms-server.mjs`,
> which mimics Strapi's REST response shape. It has not been run against a live
> Strapi instance.

## Content types

| Folder                  | Plural API id   | Page in the app                              |
| ----------------------- | --------------- | -------------------------------------------- |
| `schemas/article/`      | `articles`      | `/blog`, `/blog/[slug]`                      |
| `schemas/announcement/` | `announcements` | `/announcements`, strip on `/` and dashboard |
| `schemas/doc/`          | `docs`          | `/docs`, `/docs/[slug]` (grouped by section) |
| `schemas/release-note/` | `release-notes` | `/changelog`                                 |

All four use Draft & Publish. The app only ever receives published entries
(Strapi's REST API returns `status=published` by default). Rich text is a
Strapi **Blocks** field named `body`.

## Create them in a Strapi project

1. Create or open a Strapi v5 project (`npx create-strapi@latest`).
2. For each type, copy `schemas/<name>/schema.json` to
   `src/api/<name>/content-types/<name>/schema.json` in the Strapi project.
   Strapi also needs a controller, service and router per type; the quickest
   way is to create the type once in the Content-Type Builder with the same
   singular/plural names, then overwrite the generated `schema.json`.
3. Restart Strapi so it registers the types.

## Token and permissions

1. Settings > API Tokens > Create new API Token, type **Read-only** (or
   **Custom** with `find` and `findOne` on the four types).
2. Put it in the app's `.env`:

    ```bash
    CMS_API_URL="https://cms.example.com"   # origin only, no /api
    CMS_API_TOKEN="<the token>"
    ```

The token is only used by server code (`server-only`); it never reaches the
browser. Leave both unset and the content pages show a "Content is not set up"
notice instead of failing.

## Publish webhook (cache revalidation)

Responses are cached by Next for five minutes. To refresh sooner when someone
publishes:

1. Set `CMS_REVALIDATE_SECRET="<long random string>"` in the app's `.env`.
2. Settings > Webhooks > Create new webhook:
    - URL: `https://<app>/api/cms/revalidate`
    - Header: `Authorization` = `Bearer <the same secret>` (or `X-Cms-Secret`)
    - Events: Entry publish, unpublish, update (and delete)

The route marks every CMS response stale (`revalidateTag("cms", "max")`); the
next visit refetches. `api/cms` is excluded from the auth proxy so Strapi is
not redirected to `/login`.

## Local development without Strapi

```bash
node e2e/fixtures/cms-server.mjs        # listens on :4103
```

and in `.env`:

```bash
CMS_API_URL="http://localhost:4103"
CMS_API_TOKEN="fixture-token"
```

Playwright starts the same server automatically (see `playwright.config.ts`).

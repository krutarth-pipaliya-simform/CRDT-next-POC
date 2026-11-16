# syntax=docker/dockerfile:1.7
#
# Next.js app image (output: "standalone"). Build context = repo root.
#   docker build -t crdt-app --build-arg NEXT_PUBLIC_COLLAB_WS_URL=wss://collab.example.com .
#
# Targets: `runner` (default, the runtime image) and `tools` (full dependency
# tree + prisma CLI, used by docker-compose's one-shot `migrate` service).

ARG NODE_VERSION=24

# ---- deps: install with the lockfile ---------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
# The repo requires --legacy-peer-deps (Tiptap's strict @tiptap/core peer range).
# `postinstall` runs `prisma generate`, so the schema and config must be here.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps

# ---- builder: next build ----------------------------------------------------
FROM deps AS builder
# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, so they
# must be build args; changing them at `docker run` has no effect on the browser.
ARG NEXT_PUBLIC_COLLAB_WS_URL=""
ENV NEXT_PUBLIC_COLLAB_WS_URL=${NEXT_PUBLIC_COLLAB_WS_URL}
# src/lib/env.ts parses process.env at import time (no SKIP_ENV_VALIDATION
# switch), so `next build` needs syntactically valid placeholders. They exist in
# this stage only and never reach the runner image. Real values are runtime env.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    AUTH_SECRET="build-time-placeholder" \
    NEXT_TELEMETRY_DISABLED=1
# OPTIONAL (Sentry source-map upload): pass the token as a BuildKit secret
# (`--secret id=sentry_auth_token,env=SENTRY_AUTH_TOKEN`), never as an ARG, so
# it is not stored in image layers. Org/project are not secret. All three can
# be omitted; the build then skips the upload.
ARG SENTRY_ORG=""
ARG SENTRY_PROJECT=""
COPY . .
# `public/` is optional in this repo; make sure the runner's COPY cannot fail.
RUN mkdir -p public
RUN --mount=type=cache,target=/app/.next/cache \
    --mount=type=secret,id=sentry_auth_token,required=false \
    if [ -s /run/secrets/sentry_auth_token ]; then \
      export SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token)" SENTRY_ORG="$SENTRY_ORG" SENTRY_PROJECT="$SENTRY_PROJECT"; \
    fi; \
    npm run build

# ---- tools: schema management (prisma db push) ------------------------------
FROM builder AS tools
ENV NODE_ENV=production
CMD ["npx", "prisma", "db", "push"]

# ---- runner: minimal runtime ------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Standalone output carries the traced node_modules, including the generated
# Prisma client. static/ and public/ are not traced, so copy them in.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
# Uploads (avatars etc.) are written to ./storage at runtime: mount a volume.
RUN mkdir -p /app/storage && chown node:node /app/storage
VOLUME ["/app/storage"]
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]

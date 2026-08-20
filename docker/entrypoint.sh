#!/bin/sh
set -eu
if [ -n "${DATABASE_URL:-}" ]; then
  pnpm --filter @testproof/db db:migrate || true
fi
exec node apps/web/server.js

#!/bin/sh
set -eu
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi
node packages/db/dist/migrate.js
exec pnpm --filter @testproof/web start

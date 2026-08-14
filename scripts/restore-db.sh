#!/usr/bin/env bash
set -euo pipefail

# Restores a mysqldump file into a MySQL database, creating it first if needed.
#
# Usage: ./scripts/restore-db.sh <dump-file> <target-db-name>
#
# target-db-name is required on purpose -- there's no default that could silently
# overwrite the real dev database just because an argument was forgotten. For a
# drill/test restore, pick a throwaway name (e.g. meson_lms_restore_drill). To
# actually restore the real database in an emergency, pass its real name explicitly.
#
# If `mysql` isn't on PATH (common on Windows dev installs), point MYSQL_BIN at the
# full binary path instead, e.g.:
#   MYSQL_BIN="/c/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" ./scripts/restore-db.sh dump.sql target_db

cd "$(dirname "$0")/.."

DUMP_FILE="${1:?Usage: restore-db.sh <dump-file> <target-db-name>}"
TARGET_DB="${2:?Usage: restore-db.sh <dump-file> <target-db-name>}"

# Read .env as fallback defaults only -- pre-set environment variables (e.g.
# `DB_PASSWORD=x ./scripts/restore-db.sh ...`) must win, not get silently overwritten.
DOTENV_DB_HOST=""; DOTENV_DB_PORT=""; DOTENV_DB_NAME=""; DOTENV_DB_USER=""; DOTENV_DB_PASSWORD=""
if [ -f .env ]; then
  DOTENV_DB_HOST=$(grep -E '^DB_HOST=' .env | cut -d= -f2-)
  DOTENV_DB_PORT=$(grep -E '^DB_PORT=' .env | cut -d= -f2-)
  DOTENV_DB_NAME=$(grep -E '^DB_NAME=' .env | cut -d= -f2-)
  DOTENV_DB_USER=$(grep -E '^DB_USER=' .env | cut -d= -f2-)
  DOTENV_DB_PASSWORD=$(grep -E '^DB_PASSWORD=' .env | cut -d= -f2-)
fi

DB_HOST="${DB_HOST:-${DOTENV_DB_HOST:-localhost}}"
DB_PORT="${DB_PORT:-${DOTENV_DB_PORT:-3306}}"
DB_NAME="${DB_NAME:-${DOTENV_DB_NAME:-}}"
DB_USER="${DB_USER:-${DOTENV_DB_USER:-root}}"
DB_PASSWORD="${DB_PASSWORD:-${DOTENV_DB_PASSWORD:-}}"
MYSQL_BIN="${MYSQL_BIN:-mysql}"

if [ ! -f "$DUMP_FILE" ]; then
  echo "Dump file not found: $DUMP_FILE" >&2
  exit 1
fi

if [ "$TARGET_DB" = "${DB_NAME:-}" ]; then
  echo "WARNING: target-db-name matches DB_NAME in .env ($DB_NAME) -- this will" >&2
  echo "overwrite the real configured database. Ctrl+C now to abort." >&2
  sleep 3
fi

ARGS=(--host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER")
if [ -n "$DB_PASSWORD" ]; then
  ARGS+=(--password="$DB_PASSWORD")
fi

echo "Creating database (if not exists): $TARGET_DB"
"$MYSQL_BIN" "${ARGS[@]}" -e "CREATE DATABASE IF NOT EXISTS \`$TARGET_DB\`"

echo "Restoring $DUMP_FILE -> $TARGET_DB"
"$MYSQL_BIN" "${ARGS[@]}" "$TARGET_DB" < "$DUMP_FILE"

echo "Restore complete."

#!/usr/bin/env bash
set -euo pipefail

# Backs up the MySQL database configured in .env to backups/<db>_<timestamp>.sql.
#
# Usage: ./scripts/backup-db.sh
#
# If `mysqldump` isn't on PATH (common on Windows dev installs), point
# MYSQLDUMP_BIN at the full binary path instead, e.g.:
#   MYSQLDUMP_BIN="/c/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe" ./scripts/backup-db.sh

cd "$(dirname "$0")/.."

# Read .env as fallback defaults only -- pre-set environment variables (e.g.
# `DB_PASSWORD=x ./scripts/backup-db.sh`) must win, not get silently overwritten.
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
DB_NAME="${DB_NAME:-${DOTENV_DB_NAME:-meson_lms}}"
DB_USER="${DB_USER:-${DOTENV_DB_USER:-root}}"
DB_PASSWORD="${DB_PASSWORD:-${DOTENV_DB_PASSWORD:-}}"
MYSQLDUMP_BIN="${MYSQLDUMP_BIN:-mysqldump}"

mkdir -p backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUT_FILE="backups/${DB_NAME}_${TIMESTAMP}.sql"

ARGS=(--host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" --single-transaction --routines --triggers)
if [ -n "$DB_PASSWORD" ]; then
  ARGS+=(--password="$DB_PASSWORD")
fi

echo "Backing up ${DB_NAME}@${DB_HOST}:${DB_PORT} -> ${OUT_FILE}"
"$MYSQLDUMP_BIN" "${ARGS[@]}" "$DB_NAME" > "$OUT_FILE"
echo "Backup complete: $OUT_FILE"

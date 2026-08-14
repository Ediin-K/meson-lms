# Database backup & restore

## Scripts

- `scripts/backup-db.sh` — dumps the MySQL database configured in `.env` to
  `backups/<db>_<timestamp>.sql` via `mysqldump`.
- `scripts/restore-db.sh <dump-file> <target-db-name>` — creates `target-db-name` if
  it doesn't exist and restores a dump into it. `target-db-name` is a required
  argument on purpose: there's no default that could silently overwrite the real
  database just because an argument was forgotten.

Both read `.env` for connection details (`DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`, and `DB_NAME` for the backup script), but any of those can be
overridden by setting the environment variable before running the script — an
explicit override always wins over `.env`.

`backups/` is gitignored — dumps contain real data (password hashes, real
student/teacher records) and must never end up in git history.

## Windows-specific notes

Neither `mysql` nor `mysqldump` need to be on `PATH` — both scripts accept
`MYSQL_BIN` / `MYSQLDUMP_BIN` overrides pointing at the full binary path, e.g.:

```bash
MYSQLDUMP_BIN="/c/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe" ./scripts/backup-db.sh
MYSQL_BIN="/c/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" ./scripts/restore-db.sh <dump-file> <target-db-name>
```

If this machine has more than one MySQL install (e.g. XAMPP alongside a standalone
MySQL Server), check which one is actually listening on the configured port before
assuming `.env`'s credentials apply to "the" MySQL install — they don't necessarily
match every instance on the machine. Two `mysqld.exe` processes running
simultaneously is not itself a problem as long as only one is bound to the port in
`.env` (`DB_PORT`, default 3306); use `netstat -an | grep 3306` /
`Get-NetTCPConnection -LocalPort 3306` to check.

## Restoring for real (disaster recovery)

To restore into the actual configured database (not a drill), pass its real name as
`target-db-name`. The script prints a warning and pauses for 3 seconds when the
target matches `DB_NAME` from `.env`, specifically so this doesn't happen by
accident — Ctrl+C during that pause aborts safely, nothing has been touched yet.

## Drill performed 2026-08-14 — verified end to end

1. `./scripts/backup-db.sh` against the real `meson_lms` database — succeeded,
   produced an 85KB dump covering all 34 tables (including `flyway_schema_history`).
2. `./scripts/restore-db.sh <dump> meson_lms_restore_drill` — restored into a fresh,
   separate scratch database, never touching the real one.
3. Verified the restore actually reproduced the data, not just "the command exited
   0": compared `SHOW TABLES` output and an exact `SELECT COUNT(*)` per table
   between `meson_lms` and `meson_lms_restore_drill`. All 34 tables matched exactly
   (row counts ranged from 0 up to 239, e.g. `refresh_tokens`).
4. Dropped `meson_lms_restore_drill` afterward — it was scratch, no independent
   value once verified.

**Gotchas hit while building/running this, worth knowing before doing it again:**

- The first script draft did `source .env` unconditionally, which silently
  overwrote any environment-variable override passed on the command line (e.g.
  `DB_PASSWORD=x ./scripts/backup-db.sh` had no effect — `.env`'s value always won).
  Fixed by reading `.env` into separately-named variables and using them only as
  fallback defaults (`${DB_PASSWORD:-${DOTENV_DB_PASSWORD:-}}`), so real overrides
  now correctly take precedence.
- The Windows `mysql.exe`/`mysqldump.exe` clients emit CRLF line endings in query
  output. Piping `SHOW TABLES` results into a shell loop without stripping `\r`
  corrupted every table name used in a later backtick-quoted identifier, making
  every `SELECT COUNT(*)` silently fail (empty result, no visible error since
  stderr was suppressed) except the last table in the list. Fix: `tr -d '\r'` on
  anything read from these clients before using it as an identifier or in further
  shell logic.
- `mysqldump`/`mysql` print `Using a password on the command line interface can be
  insecure` to stderr whenever `--password=x` is passed directly — cosmetic, not an
  error, safe to ignore for local dev use.
- **`.env`'s `DB_PASSWORD` was stale (empty) — the real local root password is not
  blank.** This means the actual Spring Boot app would currently fail to connect to
  real MySQL outside of tests (which run against H2, so this was invisible). Not
  fixed as part of this drill — confirm the correct value and update `.env`
  separately before relying on it.

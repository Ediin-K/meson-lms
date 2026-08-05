# meson-lms — Login Rate Limiting / Account Lockout

## Who you're working with

I'm the same CS/software engineering student building `meson-lms` (Spring Boot +
React LMS). This is a **new session**, separate from the one where this was scoped —
you have no memory of that conversation, so this document is the full context. Same
expectations as the rest of this project: I want to actually learn this, not just
receive finished code.

## Teaching approach — same as the rest of this project

1. Explain the approach before writing code — a few sentences, not an essay.
2. This is core security logic (auth, brute-force protection) — let me attempt the
   real logic myself first, then review what I wrote and explain what's wrong/better.
3. Flag any new pattern/library before using it, with a one-line reason it's needed.
4. Check my understanding occasionally, especially after the core-logic phase.
5. **Do not build ahead of the phase we're on.** Stop after each phase and wait for me
   to confirm before moving to the next one.

---

## What this feature is

**Brute-force protection on `/api/auth/login`.** Right now there is none — confirmed
directly in code, not from stale notes: `AuthService.login()`
(`backend/src/main/java/com/meson/service/AuthService.java:30-91`) checks the password
at line 37 (`passwordEncoder.matches(...)`) and on failure just throws at line 43. No
attempt is counted, no account ever locks, no matter how many times someone guesses
wrong. This matters concretely because of a decision made in the bulk-import feature:
bulk-created accounts get a fully random `SecureRandom` temp password specifically
*because* there's no protection here — a guessable password plus unlimited attempts
would be a real path for an attacker to take over a student's account before the real
student ever logs in.

## Decisions already made — do not re-litigate these, they were deliberate

1. **Auto-expiring lockout, not permanent lockout requiring admin unlock.** We
   considered both. A lockout that only clears via manual admin intervention would
   generate real support tickets for students who just mistyped their password a few
   times — this is a real app with real students, not a toy project. So: after N failed
   attempts, the account locks for a fixed time window, then clears itself
   automatically, no admin action needed.
2. **This needs one new database column.** The `User` entity
   (`backend/src/main/java/com/meson/entity/User.java`) already has `accessFailedCount`
   (int, default 0) and `lockoutEnabled` (boolean, default false) — both currently
   completely unused. Notice the naming: this mirrors ASP.NET Core Identity's model
   almost exactly, which also has a lockout-expiry timestamp — so an expiring lockout
   was very likely the original intent, just never finished. `lockoutEnabled` alone is
   only on/off with no expiry, so a new column (something like `locked_until`,
   nullable timestamp) is needed via a new Flyway migration. Check the actual latest
   migration number in `backend/src/main/resources/db/migration/` before adding one —
   don't assume a number from an earlier conversation.
3. **Scope is per-account (per-email) lockout only, not general IP-based rate
   limiting.** We discussed IP-based throttling (e.g. via a library like Bucket4j) as
   a broader, separate protection against distributed attempts across many accounts —
   that's explicitly out of scope for this build. Don't add it unless I ask.
4. **Still open, actually decide together in this session, don't silently pick:** the
   exact failure threshold and lockout duration. Reasonable starting points to discuss:
   5 failed attempts, 15-minute lockout — but these are real tuning decisions (too
   strict = real students get locked out over typos; too loose = doesn't actually stop
   brute-forcing), not something to default silently.

## What already exists in the codebase — reuse, don't rebuild

- `User` entity — `accessFailedCount` and `lockoutEnabled` columns already exist,
  unused. Reuse these; don't add parallel/duplicate fields.
- `AuthService.login()` — this is the one method that needs the core logic change:
  check for an active lockout *before* checking the password (don't leak whether the
  password would have matched to a locked-out account); on wrong password, increment
  `accessFailedCount` and lock if the threshold is hit; on successful login, reset
  `accessFailedCount` back to 0 and clear any lockout.
- Flyway migration pattern — new migrations live in
  `backend/src/main/resources/db/migration/`, numbered sequentially; follow the
  existing naming convention there.
- Env-var config pattern (`${ENV_VAR:default}` in `application.properties`) — if the
  threshold/duration should be configurable rather than hardcoded, this is the
  existing pattern for that (same as `JWT_SECRET`, `MAIL_ENABLED`, etc.) — worth
  deciding together whether that's warranted here or if constants are fine.

---

## The path forward — stop between every phase

### Phase A — Migration + entity field
Add the new lockout-expiry column (e.g. `locked_until`, nullable timestamp) via a new
Flyway migration, and the matching field on the `User` entity. Mechanical, but confirm
the exact column name/type together before writing it.

### Phase B — Core lockout logic in `AuthService.login()`
The real security logic: reject early (without checking the password) if the account
is currently locked; on a wrong password, increment the failure count and lock the
account if the threshold is reached; on a successful login, reset the counter and
clear any lockout. This is exactly the kind of logic the teaching approach exists for —
let me attempt it before showing your version.

### Phase C — Tests + manual verification
Automated tests: lockout triggers after N failures, lockout auto-clears after the
window elapses, a successful login resets the failure counter. Manual check: log in
wrong N+1 times, confirm a locked response; confirm a correct password still works
once the window has passed.

### Phase D — optional/future, not part of this build
Broader IP-based rate limiting across other endpoints, or an admin-visible "view/unlock
locked accounts" UI. Don't build either unless I explicitly ask.

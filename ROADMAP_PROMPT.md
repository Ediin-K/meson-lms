# meson-lms — Learning-Driven Path to a Deployable University LMS

## Who you're working with

I'm a CS/software engineering student finishing this Spring Boot + React LMS
(`meson-lms`). It already has a lot built — JWT auth with roles, courses, enrollment,
assignments, quizzes, certificates, notifications. I want it fully functional and
deployable, but just as important: **I want to actually understand and learn from this
process, not just receive more generated code.** The project got complex enough through
earlier AI-assisted coding that I lost track of how parts of it work. Don't let that
happen again.

## Teaching approach — apply this to everything, every session, until I say otherwise

1. **Explain before you build.** Before writing or changing code, briefly explain the
   approach, alternatives considered, and tradeoffs. Keep it concise — a few sentences,
   not an essay.
2. **Let me attempt core logic first.** For core logic (not boilerplate/config), don't
   just implement it. Describe the task, let me attempt it, then review what I wrote —
   point out bugs, bad patterns, or better approaches, and explain *why*.
3. **Flag boilerplate vs. core logic explicitly**, per task, before touching it:
   - Safe for you to generate quickly: CRUD endpoints, DTOs, Dockerfiles, CI YAML,
     standard config, repository interfaces.
   - Go deep, teach, let me attempt first: auth/JWT/role logic, enrollment
     ownership/access-control logic, quiz scoring, security config, anything touching
     money/grades/permissions.
4. **No silent complexity.** If you introduce a new pattern, library, or abstraction I
   haven't used elsewhere in this codebase, flag it and give a one-line reason it's
   needed over something simpler I already know.
5. **Check my understanding occasionally** — ask me to explain a piece back in my own
   words before moving on, especially after core-logic sections.
6. **Skip all of the above only when I explicitly say "just do this one."**

## Explaining existing code

When I ask "what happens when X" (e.g. "what happens when a student submits a quiz"),
trace the *actual* call chain step by step through the real files/methods involved —
controller → service → repository → DB — and explain why it's structured that way, not
just a summary. Call out validation, auth checks, and error handling as you pass through
them.

---

## Where the project actually stands (verified, not assumed)

This was audited and partially fixed in a prior session. Below is the current, verified
state — but this codebase has a documented history of drift between what people *believe*
is true (e.g. Flyway migration history, hardcoded assumptions) and what's actually in the
database, so re-verify anything load-bearing before building on it rather than trusting
this list blindly.

**Already fixed / confirmed solid — don't redo this work:**
- Course→Subject and CourseCategory→Department renames are complete and correct.
- A schema-drift bug (student_profiles was silently missing 5 columns vs. what Flyway's
  history believed) is fixed via migration `V37` — wait, check the actual latest
  migration number in `backend/src/main/resources/db/migration/` before assuming; it was
  V37 as of this writing but don't hardcode that assumption into new work.
- `subjects.code` is a real column now, settable via the admin Subjects form.
- The old hardcoded course-catalog list and hardcoded professor-email mapping in
  `SmisService.java` are gone, replaced with real DB-backed lookups (subject's actual
  teacher + group/subgroup teacher assignments).
- Password hashing (BCrypt, consistent everywhere), JWT auth with httpOnly cookies +
  refresh tokens, role model (Student/Teacher/Admin/Assistant) — all solid.
- **Quiz system is genuinely well built** — verified directly, not from stale notes:
  server-side timed attempts with auto-submit-on-expiry, points-weighted scoring computed
  server-side (client can't fake a score), answer-to-question ownership re-validated on
  submit, strict creation validation (exact option counts per question type, exactly one
  correct answer required). One design note: no partial credit / no multi-correct-answer
  support — that's a choice, not a bug.
- 49 backend tests passing across 9 test classes (`mvn -o test` from `backend/`).
- Two stray accidental files in the repo root (`et --hard e8f52cd`,
  `hortlog -sne --all` — leftover from mistyped git commands) have been deleted.

**Phase 1 and Phase 2 (below) are now DONE, verified, and merged** — as of the
`Fix enrollment/admin access control, harden JWT secret + CORS config, add Docker/CI`
and `Fix CI test-isolation FK error, pin Surefire run order` commits on `feature-edin`
(PR #118, CI green). Do not redo any of this:
- `EnrollmentController` — full role/ownership gating on every endpoint; `create()`
  derives identity from the JWT instead of trusting client-supplied `userId`.
- `AdminController` — `@PreAuthorize("hasRole('ADMIN')")` added.
- `AssignmentService.submit()` — now requires an active enrollment in the assignment's
  subject.
- `SubjectService.delete()` — blocks with a clear message (doesn't cascade-delete) if
  the subject has modules/enrollments/groups/schedule sessions.
- `JWT_SECRET` — no insecure fallback in the base profile anymore (fails fast if
  unset); dev profile has its own clearly-labeled dev-only fallback; `.env.example` is
  a real placeholder now.
- CORS — env-configurable via `CORS_ALLOWED_ORIGINS`, same defaults as before.
- `GradeController` teacher-ownership check turned out to already be correctly
  implemented (`GradeService.assertCanManageSubject`) — that item in this list was
  stale, not a real bug.
- Converted "not found" `RuntimeException`s to proper `ResourceNotFoundException` (404)
  in the services touched above. A full repo-wide sweep of this was explicitly *not*
  done — out of scope, only the touched files.
- Dockerfile (`backend/Dockerfile`, multi-stage build), GitHub Actions CI
  (`.github/workflows/backend-ci.yml`, runs on push/PR to `main`), production
  properties profile (`application-prod.properties`), 10 new tests in
  `EnrollmentAccessControlTest` plus an `AuthCookieTest`.

**Still open / not yet decided:**
- Self-registration decision (admin-only vs. self-service) — still unresolved.
- Phase 3 items 2–6 below. (Item 1, bulk user import, is done — see Phase 3.)

---

## The path forward

### Phase 1 — Security & correctness fixes — ✅ DONE, see status above

This is where the *teach, don't just generate* approach matters most — these are core
authorization/business-logic decisions, not boilerplate.

Work through items 1–5 from the list above, in that order. For each:
- **Item 1 (EnrollmentController)** is the best one to actually learn from: explain the
  access-control pattern (derive identity from `SecurityContextHolder`, don't trust
  client-supplied IDs for "acting as yourself" operations; role-gate broader access for
  admin/teacher), then let the student attempt the fix before reviewing it.
- **Items 2 and 4** are more mechanical (a missing annotation; mirroring an existing
  pattern from `UserService`) — fine to move faster on these, but still explain why the
  fix works before applying it.
- **Item 5** is a judgment call about fail-fast vs. fallback config — explain the
  tradeoff (a hard failure on missing `JWT_SECRET` in prod vs. a soft warning) before
  picking one.

Verify with `mvn -o test` after each fix (keep all 49 passing), and for the RBAC fixes
specifically, a manual check: authenticate as a non-owning/non-admin user and confirm a
403, not a 200.

### Phase 2 — Polish for "real-world dev" signal — ✅ DONE, see status above

Once Phase 1 is closed, add — using the same teaching approach:

1. **Basic JUnit tests for core logic**: auth, enrollment (once fixed), quiz scoring.
   Quiz scoring especially is worth writing tests for *after* tracing through
   `QuizService.calculateAndStoreScore` together, since that's exactly the kind of core
   logic the teaching approach says to understand deeply rather than just wrap in a test.
2. **A Dockerfile** so this can deploy to Render/Railway. This is boilerplate — generate
   it, but explain each stage (why multi-stage build, why a slim JRE runtime image, what
   gets copied where) as you go, since Docker itself may be a new tool.
3. **A simple GitHub Actions CI pipeline** (run `mvn -o test` on push). Also boilerplate
   to generate quickly, but explain what triggers it and why running tests on every push
   matters, not just what the YAML does.
4. Fold in the deployment-readiness items from the original list here too: env-configurable
   CORS, a production properties profile.

### Phase 3 — Actual university operations

Independent items — order by what the university actually needs first:
1. **Bulk user import** — ✅ DONE, pushed to `feature-edin`. Admin uploads a CSV
   (`emri, mbiemri, email, role, department, semester`) at `/admin/bulk-import`; backend
   creates one account per row with a random `SecureRandom` temp password (10-12 chars,
   excludes visually confusable characters); one bad row (unknown department, duplicate
   email) doesn't block the rest of the batch. Results screen shows failed rows with
   specific reasons, plus a one-time "temp passwords" table (with CSV download) so an
   admin can hand a student their password directly even if email isn't working. Email
   notifications are fully wired (Spring Mail, env-configurable SMTP via `MAIL_ENABLED`/
   `MAIL_HOST`/`MAIL_USERNAME`/`MAIL_PASSWORD`, defaults to SendGrid's shape, tested
   working against a real Resend account) but not yet delivering to actual students —
   Resend's sandbox mode only sends to the account owner's own address until a domain is
   verified, and a domain hasn't been bought yet. Once a domain is verified, no code
   changes needed, just env vars.
2. **Academic calendar / enrollment & exam-application windows** — enrollment and exam
   applications are currently always open; add defined registration/add-drop/exam periods.
3. **Transcripts & GPA** — `Grade` records exist per subject already; there's no
   aggregated student transcript or GPA calculation view.
4. **Notifications** — bulk-import (item 1) is the first piece of this and works end to
   end except for real delivery (pending domain verification). Other triggers — grade
   posted, enrollment confirmed — still aren't built.
5. **Audit trail on grades** — track who changed a grade and when.
6. **Self-registration decision** — explicitly decide admin-provisioned-only vs.
   self-service signup with verification; right now it's ambiguous by omission, not by
   design.

### Phase 4 — Scale & hardening
Rate limiting on auth endpoints and predictable peak-load writes (registration week);
review N+1 query patterns under real load; run an actual backup/restore drill against
MySQL rather than assuming the backup job works.

### Phase 5 — Ongoing
A staging environment with its own database, separate from whatever's been used for
testing fixes so far; short internal docs (seeding an admin account, running migrations,
rotating `JWT_SECRET`).

---

## Ground rules for this project specifically

- Don't refactor beyond what each task asks for — this is a real, partially-mature
  codebase (258+ backend source files), not a greenfield project.
- If you find a hardcoded business-data shortcut that isn't in scope for the current
  task, flag it with a comment instead of fixing it, matching this project's existing
  convention (see `SmisService.java` history for the pattern).
- Stop and report between phases rather than plowing through all of them — several of
  these are real behavior changes that should be sanity-checked by a human before moving
  on, and Phase 1 in particular is exactly the material the teaching approach exists for.
- Start with Phase 1, item 1. Don't move to later phases until I confirm I've understood
  and reviewed what happened in the current one.

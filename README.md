# Meson LMS

Meson LMS is a full-stack Learning Management System and SMIS (Student Management
Information System) built with Spring Boot, React, and MySQL. It supports
role-based access for administrators, department heads, teachers, and students
(one account can hold several roles at once), covering everything from course
content (subjects, modules, lessons, file resources, assignments, quizzes) to
real university operations (bulk enrollment, academic terms, transcripts and GPA,
attendance tracking, grade audit trails, in-app notifications, and exam
registration).

## Technologies

### Backend
- Java 21
- Spring Boot 3.4
- Spring Web
- Spring Security
- JWT authentication
- Spring Data JPA
- Flyway database migrations
- Spring Mail (transactional email)
- MySQL
- Swagger/OpenAPI with Springdoc

### Frontend
- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Material UI
- Recharts

### Database
- MySQL relational database
- Flyway migrations in `backend/src/main/resources/db/migration`
- Foreign keys, indexes, and constraints are defined in SQL migrations

## Main Features

- JWT authentication via httpOnly cookies, with refresh tokens
- Role-based authorization (Admin, Department Head, Teacher, Student). One account
  can hold multiple roles; the header has a "Viewing as" switcher that changes the
  active view while the backend still honours every role the account holds
- Department Head: a department-scoped admin — own-department dashboard, subject
  CRUD, teaching-assignment oversight, department grade audit log, and read-only
  student/attendance visibility for their department
- Per-account login lockout (7 failed attempts locks for 15 minutes, auto-expires)
  and IP-based login rate limiting
- Admin, department head, teacher, and student dashboards
- Subject and Department management (CRUD)
- Module and lesson management, with file upload/preview/download for lesson
  resources
- Assignment creation, submission, and grading
- Quiz creation, publishing, timed attempts, automatic backend scoring, and a
  teacher results dashboard
- Subject groups/subgroups and schedule management
- Attendance tracking: teachers mark a roster (present / absent / late / excused)
  per session and date; students see their own history and stats; department heads
  and admins get worst-first summaries with subject and date-range filters, CSV
  export, and a per-student drill-down page
- Bulk user import via CSV, with per-row partial success, temp passwords, and
  optional email delivery
- Academic terms that gate enrollment and exam-registration windows
- SMIS exam registration
- Transcripts with ECTS-weighted GPA, grouped by semester, printable/exportable;
  admins can view any student's transcript
- Grade audit trail (who changed a grade, when, and the before/after value),
  viewable per-grade by teachers, department-scoped by department heads, and
  globally by admins
- In-app notifications (bell icon with unread count) plus best-effort email, fired
  on grade posting, enrollment confirmation, and SMIS exam grading; email is
  opt-in via `MAIL_ENABLED`
- Certificate management
- Cookie/privacy consent UI

## Project Structure

```text
meson-lms/
  backend/
    src/main/java/com/meson/
      config/
      controller/
      dto/
      entity/
      exception/
      repository/
      service/
    src/main/resources/
      application.properties
      db/migration/
  frontend/
    src/
      components/
      context/
      layouts/
      pages/
      services/
      utils/
```

## Requirements

- Java 21
- Maven
- Node.js 20+
- MySQL 8+

## Environment Configuration

Copy `.env.example` and configure values for your machine.

Backend reads these values from environment variables:

```text
DB_HOST=localhost
DB_PORT=3306
DB_NAME=meson_lms
DB_USER=root
DB_PASSWORD=
JWT_SECRET=base64-secret
JWT_EXPIRATION=900000

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

RATE_LIMIT_LOGIN_MAX_ATTEMPTS=20
RATE_LIMIT_LOGIN_WINDOW_MINUTES=15

MAIL_ENABLED=false
MAIL_FROM=no-reply@meson-lms.com
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=
```

All of the above have working defaults except `JWT_SECRET`, which has no fallback
outside the dev profile — the app fails fast if it's unset. `MAIL_ENABLED` defaults
to `false`, so email sending is off until a real provider key is configured.

Frontend reads:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

For local development, default values are already provided in `application.properties`.

## Running The Backend

Create the MySQL database first:

```sql
CREATE DATABASE meson_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then start the backend:

```bash
cd backend
mvn spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

Flyway automatically applies migrations on startup.

## Running The Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Docker & CI

- `backend/Dockerfile` is a multi-stage build (Maven build stage, then a slim JRE
  runtime image) producing a deployable backend image.
- GitHub Actions (`.github/workflows/backend-ci.yml`) runs the backend test suite on
  every push and pull request to `main`.

## Swagger / OpenAPI

Swagger UI is enabled for API documentation and testing:

```text
http://localhost:8080/swagger-ui/index.html
```

OpenAPI JSON:

```text
http://localhost:8080/v3/api-docs
```

For protected endpoints:

1. Call `POST /api/auth/login`.
2. Copy the returned JWT token.
3. Click `Authorize` in Swagger.
4. Paste the token in the Bearer JWT field.

## Important API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login; sets JWT + refresh cookies, returns the account's role list |
| POST | `/api/auth/refresh` | Refresh expired JWT |
| POST | `/api/auth/change-temporary-password` | Set a real password after an admin-issued temp one |

The JWT carries every role the account holds, so a single login authenticates for
all of that account's roles' endpoints.

### Subjects And Lessons

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/subjects` | Public subject list |
| GET | `/api/subjects/{id}` | Subject details |
| GET | `/api/subjects/{subjectId}/modules` | Subject modules |
| GET | `/api/modules/{moduleId}/lessons` | Module lessons |
| GET | `/api/resources/{id}/download` | Download lesson resource |
| GET | `/api/resources/{id}/view` | Preview lesson resource |

### Teacher Content

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/teacher/subjects` | Teacher's subjects |
| POST | `/api/teacher/modules` | Create module |
| POST | `/api/teacher/lessons` | Create lesson |
| POST | `/api/teacher/files/upload/lesson/{lessonId}` | Upload lesson file |
| POST | `/api/teacher/quizzes` | Create quiz |
| POST | `/api/teacher/quizzes/{id}/publish` | Publish quiz |
| GET | `/api/teacher/quizzes/{id}/results` | Quiz results for teacher |

### Quiz System

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/quizzes` | Student | List published quizzes |
| POST | `/api/quizzes/{id}/start` | Student | Start timed attempt |
| POST | `/api/quizzes/{id}/submit` | Student | Submit answers |
| GET | `/api/teacher/quizzes/{id}/results` | Teacher | View student scores |

Quiz scoring is calculated in the backend. Students see their own percentage score
immediately after submitting, but do not receive the answer key or per-question
correctness.

### University Operations

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/bulk-import` | Bulk-create accounts from a CSV upload |
| GET/POST | `/api/academic-terms` | Manage academic terms (enrollment/exam windows) |
| GET | `/api/grades/student/{id}` | Student transcript (grades + GPA) |
| GET | `/api/grades/audit-log` | Grade audit log (admin: global; department head: own department) |
| GET | `/api/grades/{id}/history` | Per-grade audit history |
| POST | `/api/smis/exam-applications` | Register for an exam |

### Attendance

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/attendance/sessions/{id}/roster` | Teacher/Admin | Roster for a session on a date |
| POST | `/api/attendance/sessions/{id}/mark` | Teacher/Admin | Mark statuses for a session/date |
| GET | `/api/attendance/student/{id}` | self / Teacher / Admin | One student's attendance history + stats |
| GET | `/api/attendance/admin/summary` | Admin | Cross-department summary (dept/subject/date filters) |
| GET | `/api/attendance/admin/student/{id}` | Admin | Per-student drill-down |

### Department Head

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/department-head/dashboard` | Own-department counts |
| GET | `/api/department-head/subjects` | Own-department subjects |
| GET | `/api/department-head/students` | Students enrolled in own-department subjects |
| GET | `/api/department-head/attendance` | Own-department attendance summary (subject/date filters) |
| GET | `/api/department-head/attendance/{studentId}` | Per-student drill-down (department-scoped) |

Subject create/update/delete (`/api/subjects`) also accepts a department head,
scoped to their own department.

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Current user's notifications |
| GET | `/api/notifications/unread-count` | Unread count for the bell badge |
| PATCH | `/api/notifications/{id}/read` | Mark one as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

## Security

- JWT authentication via httpOnly cookies, with refresh tokens. The token carries
  the account's full role list, granted as authorities on each request.
- Protected frontend routes check role membership (a multi-role account may open
  any of its roles' sections); backend endpoints use Spring Security and
  `@PreAuthorize`. Department-scoped actions check `hasRole('ADMIN') or
  (hasRole('DEPARTMENT_HEAD') and <owns this department>)` — admin is never
  excluded.
- Passwords are hashed with BCrypt.
- Per-account login lockout: 7 failed attempts locks the account for 15 minutes,
  auto-expires, no admin action needed.
- IP-based login rate limiting, independent of per-account lockout — catches one IP
  spraying passwords across many accounts, which per-account lockout alone can't.
- CORS is restricted via `CORS_ALLOWED_ORIGINS` (env-configurable; defaults to local
  dev origins).
- `JWT_SECRET` has no insecure fallback outside the dev profile — the app fails fast
  if it's unset in other profiles.
- Lesson resource download/view endpoints are intentionally public, to support
  access to course material from public pages.
- Production deployments should set a real `JWT_SECRET` via environment variable and
  serve over HTTPS.

## Database Design

The main entities, grouped by area:

**Identity & access**: `users`, `roles`, `user_roles` (many-to-many — an account
may hold several roles), `user_claims`, `user_tokens`, `refresh_tokens`

**Academic structure**: `universities`, `departments` (a nullable `head_user_id`
FK marks the department head), `subjects`, `modules`, `lessons`,
`lesson_resources`, `academic_terms`

**Enrollment & groups**: `enrollments`, `department_groups`, `subject_groups`,
`subject_group_teachers`, `subject_subgroups`, `subject_subgroup_teachers`,
`student_group_requests`, `student_group_selections`, `student_profiles`,
`schedule_sessions`

**Coursework**: `assignments`, `assignment_submissions`, `quizzes`,
`quiz_questions`, `quiz_answers`, `quiz_attempts`, `answer_submissions`,
`lesson_progress`

**Grades & records**: `grades`, `grade_audit_logs`, `attendance_records`,
`notifications`, `certificates`

Migrations include indexes and foreign key constraints to preserve relational
integrity.

## Frontend Optimization

The frontend uses route-level lazy loading with `React.lazy` and `Suspense` in
`App.jsx` to reduce the initial JavaScript bundle loaded by the browser.

## Operations

- `scripts/backup-db.sh` / `scripts/restore-db.sh` — MySQL backup and restore,
  `.env`-aware. See [`docs/BACKUP_RESTORE.md`](docs/BACKUP_RESTORE.md) for the full
  runbook, including a walkthrough of a real restore drill against the live
  database.

## Testing And Verification

Backend build and tests:

```bash
cd backend
mvn clean test
```

Frontend production build:

```bash
cd frontend
npm run build
```

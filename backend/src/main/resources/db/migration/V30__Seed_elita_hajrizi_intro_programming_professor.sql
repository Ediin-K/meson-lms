INSERT INTO roles (emertimi, pershkrimi, normalized_name)
SELECT 'teacher', 'Profesor / Staf akademik', 'TEACHER'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE normalized_name = 'TEACHER'
);

INSERT INTO users (
    emri,
    mbiemri,
    email,
    password_hash,
    phone_number,
    email_confirmed,
    lockout_enabled,
    access_failed_count,
    data_krijimit,
    statusi
)
SELECT
    'Elita',
    'Hajrizi',
    'elita.hajrizi@meson.com',
    '$2a$10$zKsTK3YVU36/1CYs48Y6AuTG8g02wwtpSTLdVjX7r3dveF31piUXW',
    NULL,
    TRUE,
    FALSE,
    0,
    CURRENT_TIMESTAMP,
    'active'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'elita.hajrizi@meson.com'
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.normalized_name = 'TEACHER'
WHERE u.email = 'elita.hajrizi@meson.com'
  AND NOT EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.user_id = u.id
        AND ur.role_id = r.id
  );

UPDATE courses
SET teacher_id = (SELECT id FROM users WHERE email = 'elita.hajrizi@meson.com' LIMIT 1),
    statusi = 'PUBLIKUAR',
    semester = 1,
    ects = 5
WHERE titulli IN (
    'Hyrje në Shkenca Kompjuterike dhe Programim',
    'Hyrje ne Shkenca Kompjuterike dhe Programim',
    'Hyrje në Shkenca dhe Programim',
    'Hyrje ne Shkenca dhe Programim',
    'Hyrje nÃ« Shkenca Kompjuterike dhe Programim'
);

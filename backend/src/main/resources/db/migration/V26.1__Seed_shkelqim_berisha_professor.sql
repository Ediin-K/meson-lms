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
    'Shkelqim',
    'Berisha',
    'shkelqim.berisha@meson.com',
    '$2a$10$zKsTK3YVU36/1CYs48Y6AuTG8g02wwtpSTLdVjX7r3dveF31piUXW',
    NULL,
    TRUE,
    FALSE,
    0,
    CURRENT_TIMESTAMP,
    'active'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'shkelqim.berisha@meson.com'
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.normalized_name = 'TEACHER'
WHERE u.email = 'shkelqim.berisha@meson.com'
  AND NOT EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.user_id = u.id
        AND ur.role_id = r.id
  );

INSERT INTO courses (titulli, pershkrimi, teacher_id, category_id, semester, enrollment_key, cmimi, ects, niveli, statusi, created_at)
SELECT
    'Algoritmet dhe Strukturat e të dhënave',
    'Lende e programit Shkenca kompjuterike dhe inxhinieri',
    (SELECT id FROM users WHERE email = 'shkelqim.berisha@meson.com' LIMIT 1),
    (SELECT id FROM course_categories WHERE emertimi = 'Shkenca kompjuterike dhe inxhinieri' LIMIT 1),
    2,
    NULL,
    0.0,
    5,
    'TE_GJITHA_NIVELET',
    'PUBLIKUAR',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM courses WHERE titulli = 'Algoritmet dhe Strukturat e të dhënave'
);

UPDATE courses
SET teacher_id = (SELECT id FROM users WHERE email = 'shkelqim.berisha@meson.com' LIMIT 1),
    category_id = (SELECT id FROM course_categories WHERE emertimi = 'Shkenca kompjuterike dhe inxhinieri' LIMIT 1),
    statusi = 'PUBLIKUAR',
    semester = CASE
        WHEN titulli = 'Hyrje ne Algoritme' THEN 2
        WHEN titulli = 'Algoritmet dhe Strukturat e të dhënave' THEN 2
        ELSE semester
    END,
    ects = CASE
        WHEN titulli = 'Hyrje ne Algoritme' THEN 4
        WHEN titulli = 'Algoritmet dhe Strukturat e të dhënave' THEN 5
        ELSE ects
    END
WHERE titulli IN (
    'Hyrje ne Algoritme',
    'Algoritmet dhe Strukturat e të dhënave'
);

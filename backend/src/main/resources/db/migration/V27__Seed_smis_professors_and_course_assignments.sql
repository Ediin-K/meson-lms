INSERT INTO roles (emertimi, pershkrimi, normalized_name)
SELECT 'teacher', 'Profesor / Staf akademik', 'TEACHER'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE normalized_name = 'TEACHER'
);

INSERT INTO course_categories (emertimi, pershkrimi)
SELECT 'Shkenca kompjuterike dhe inxhinieri', 'Programi i studimeve per shkenca kompjuterike dhe inxhinieri'
WHERE NOT EXISTS (
    SELECT 1 FROM course_categories WHERE emertimi = 'Shkenca kompjuterike dhe inxhinieri'
);

INSERT INTO users (emri, mbiemri, email, password_hash, phone_number, email_confirmed, lockout_enabled, access_failed_count, data_krijimit, statusi)
SELECT seed.emri, seed.mbiemri, seed.email, '$2a$10$zKsTK3YVU36/1CYs48Y6AuTG8g02wwtpSTLdVjX7r3dveF31piUXW', NULL, TRUE, FALSE, 0, CURRENT_TIMESTAMP, 'active'
FROM (
    SELECT 'Bertan' AS emri, 'Karahoda' AS mbiemri, 'bertan.karahoda@meson.com' AS email
    UNION ALL SELECT 'Greta', 'Ahma', 'greta.ahma@meson.com'
    UNION ALL SELECT 'Erzen', 'Talla', 'erzen.talla@meson.com'
    UNION ALL SELECT 'Ramadan', 'Dervishi', 'ramadan.dervishi@meson.com'
    UNION ALL SELECT 'Lavdim', 'Menxhiqi', 'lavdim.menxhiqi@meson.com'
    UNION ALL SELECT 'Besnik', 'Qehaja', 'besnik.qehaja@meson.com'
    UNION ALL SELECT 'Kjani', 'Guri', 'kjani.guri@meson.com'
    UNION ALL SELECT 'Zijadin', 'Krasniqi', 'zijadin.krasniqi@meson.com'
    UNION ALL SELECT 'Diellza', 'Berisha', 'diellza.berisha@meson.com'
    UNION ALL SELECT 'Nazmi', 'Misini', 'nazmi.misini@meson.com'
    UNION ALL SELECT 'Armend', 'Ymeri', 'armend.ymeri@meson.com'
    UNION ALL SELECT 'Vehbi', 'Sofiu', 'vehbi.sofiu@meson.com'
    UNION ALL SELECT 'Zhilbert', 'Tafa', 'zhilbert.tafa@meson.com'
    UNION ALL SELECT 'Elton', 'Boshnjaku', 'elton.boshnjaku@meson.com'
    UNION ALL SELECT 'Naim', 'Llumnica', 'naim.llumnica@meson.com'
    UNION ALL SELECT 'Blerim', 'Zylfiu', 'blerim.zylfiu@meson.com'
    UNION ALL SELECT 'Lamir', 'Shkurti', 'lamir.shkurti@meson.com'
    UNION ALL SELECT 'Shejnaze', 'Gagica', 'shejnaze.gagica@meson.com'
    UNION ALL SELECT 'Hizer', 'Leka', 'hizer.leka@meson.com'
    UNION ALL SELECT 'Valdrin', 'Haxhiu', 'valdrin.haxhiu@meson.com'
    UNION ALL SELECT 'Lavdim', 'Beqiri', 'lavdim.beqiri@meson.com'
    UNION ALL SELECT 'Blerton', 'Abazi', 'blerton.abazi@meson.com'
) seed
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE users.email = seed.email
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.normalized_name = 'TEACHER'
WHERE u.email IN (
    'shkelqim.berisha@meson.com',
    'bertan.karahoda@meson.com',
    'greta.ahma@meson.com',
    'erzen.talla@meson.com',
    'ramadan.dervishi@meson.com',
    'lavdim.menxhiqi@meson.com',
    'besnik.qehaja@meson.com',
    'kjani.guri@meson.com',
    'zijadin.krasniqi@meson.com',
    'diellza.berisha@meson.com',
    'nazmi.misini@meson.com',
    'armend.ymeri@meson.com',
    'vehbi.sofiu@meson.com',
    'zhilbert.tafa@meson.com',
    'elton.boshnjaku@meson.com',
    'naim.llumnica@meson.com',
    'blerim.zylfiu@meson.com',
    'lamir.shkurti@meson.com',
    'shejnaze.gagica@meson.com',
    'hizer.leka@meson.com',
    'valdrin.haxhiu@meson.com',
    'lavdim.beqiri@meson.com',
    'blerton.abazi@meson.com'
)
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

INSERT INTO courses (titulli, pershkrimi, teacher_id, category_id, semester, enrollment_key, cmimi, ects, niveli, statusi, created_at)
SELECT seed.titulli,
       'Lende e programit Shkenca kompjuterike dhe inxhinieri',
       (SELECT id FROM users WHERE email = seed.teacher_email LIMIT 1),
       (SELECT id FROM course_categories WHERE emertimi = 'Shkenca kompjuterike dhe inxhinieri' LIMIT 1),
       seed.semester,
       NULL,
       0.0,
       seed.ects,
       'TE_GJITHA_NIVELET',
       'PUBLIKUAR',
       CURRENT_TIMESTAMP
FROM (
    SELECT 'Bazat e Teknologjive Big Data' AS titulli, 4 AS semester, 5 AS ects, 'bertan.karahoda@meson.com' AS teacher_email
    UNION ALL SELECT 'Dizajni dhe Zhvillimi i Uebit', 4, 5, 'greta.ahma@meson.com'
    UNION ALL SELECT 'Inxhinieria Softuerike', 4, 5, 'erzen.talla@meson.com'
    UNION ALL SELECT 'Sistemet e Bazës së të Dhënave', 4, 5, 'erzen.talla@meson.com'
    UNION ALL SELECT 'Shkenca Kompjuterike 2', 2, 5, 'lavdim.menxhiqi@meson.com'
    UNION ALL SELECT 'Lënda Laboratorike 1 (Projekt Grupor)', 4, 5, 'lavdim.menxhiqi@meson.com'
    UNION ALL SELECT 'Qarqet Digjitale dhe Sinjalet', 3, 5, 'besnik.qehaja@meson.com'
    UNION ALL SELECT 'Struktura Diskrete 1 (Matematikë)', 1, 5, 'diellza.berisha@meson.com'
    UNION ALL SELECT 'Struktura Diskrete 2 (Probabilitet dhe Modelim)', 2, 5, 'diellza.berisha@meson.com'
    UNION ALL SELECT 'Algoritmet dhe Strukturat e të dhënave', 2, 5, 'shkelqim.berisha@meson.com'
) seed
WHERE NOT EXISTS (
    SELECT 1 FROM courses WHERE courses.titulli = seed.titulli
);

UPDATE courses
SET category_id = (SELECT id FROM course_categories WHERE emertimi = 'Shkenca kompjuterike dhe inxhinieri' LIMIT 1),
    statusi = 'PUBLIKUAR',
    niveli = 'TE_GJITHA_NIVELET',
    semester = CASE titulli
        WHEN 'Bazat e Teknologjive Big Data' THEN 4
        WHEN 'Dizajni dhe Zhvillimi i Uebit' THEN 4
        WHEN 'Inxhinieria Softuerike' THEN 4
        WHEN 'Sistemet e Bazës së të Dhënave' THEN 4
        WHEN 'Shkenca Kompjuterike 2' THEN 2
        WHEN 'Lënda Laboratorike 1 (Projekt Grupor)' THEN 4
        WHEN 'Qarqet Digjitale dhe Sinjalet' THEN 3
        WHEN 'Struktura Diskrete 1 (Matematikë)' THEN 1
        WHEN 'Struktura Diskrete 2 (Probabilitet dhe Modelim)' THEN 2
        WHEN 'Algoritmet dhe Strukturat e të dhënave' THEN 2
        ELSE semester
    END,
    ects = 5
WHERE titulli IN (
    'Bazat e Teknologjive Big Data',
    'Dizajni dhe Zhvillimi i Uebit',
    'Inxhinieria Softuerike',
    'Sistemet e Bazës së të Dhënave',
    'Shkenca Kompjuterike 2',
    'Lënda Laboratorike 1 (Projekt Grupor)',
    'Qarqet Digjitale dhe Sinjalet',
    'Struktura Diskrete 1 (Matematikë)',
    'Struktura Diskrete 2 (Probabilitet dhe Modelim)',
    'Algoritmet dhe Strukturat e të dhënave'
);

INSERT INTO course_categories (emertimi, pershkrimi)
SELECT 'Shkenca kompjuterike dhe inxhinieri', 'Programi i studimeve per shkenca kompjuterike dhe inxhinieri'
WHERE NOT EXISTS (
    SELECT 1 FROM course_categories WHERE emertimi = 'Shkenca kompjuterike dhe inxhinieri'
);

INSERT INTO courses (titulli, pershkrimi, teacher_id, category_id, semester, enrollment_key, cmimi, ects, niveli, statusi, created_at)
SELECT seed.titulli,
       'Lende e programit Shkenca kompjuterike dhe inxhinieri',
       (SELECT id FROM users ORDER BY id LIMIT 1),
       (SELECT id FROM course_categories WHERE emertimi = 'Shkenca kompjuterike dhe inxhinieri' LIMIT 1),
       seed.semester,
       NULL,
       0.0,
       seed.ects,
       'TE_GJITHA_NIVELET',
       'PUBLIKUAR',
       CURRENT_TIMESTAMP
FROM (
    SELECT 'Hyrje në Shkenca Kompjuterike dhe Programim' AS titulli, 1 AS semester, 5 AS ects
    UNION ALL SELECT 'Matematikë 1', 1, 5
    UNION ALL SELECT 'Bazat e Inxhinierise Elektronike / Elektrike', 1, 6
    UNION ALL SELECT 'Arkitektura dhe Organizimi i Kompjuterëve', 1, 5
    UNION ALL SELECT 'Shkrim Akademik dhe Seminar', 1, 5
    UNION ALL SELECT 'Gjuhë Angleze për Inxhinieri', 1, 4
    UNION ALL SELECT 'Matematikë 2', 2, 5
    UNION ALL SELECT 'Sistemet Operative', 2, 5
    UNION ALL SELECT 'Shkenca Kompjuterike 1', 2, 6
    UNION ALL SELECT 'Hyrje në Sigurinë e Informacionit', 2, 4
    UNION ALL SELECT 'Ndërveprimi Kompjuter-Njeri', 2, 5
    UNION ALL SELECT 'Rrjeta Kompjuterike dhe Komunikimi', 2, 5
    UNION ALL SELECT 'Hyrje ne Algoritme', 2, 4
) seed
WHERE (SELECT COUNT(*) FROM users) > 0
  AND NOT EXISTS (
      SELECT 1 FROM courses WHERE courses.titulli = seed.titulli
  );

UPDATE courses
SET category_id = (SELECT id FROM course_categories WHERE emertimi = 'Shkenca kompjuterike dhe inxhinieri' LIMIT 1),
    statusi = 'PUBLIKUAR',
    niveli = 'TE_GJITHA_NIVELET',
    semester = CASE titulli
        WHEN 'Hyrje në Shkenca Kompjuterike dhe Programim' THEN 1
        WHEN 'Matematikë 1' THEN 1
        WHEN 'Bazat e Inxhinierise Elektronike / Elektrike' THEN 1
        WHEN 'Arkitektura dhe Organizimi i Kompjuterëve' THEN 1
        WHEN 'Shkrim Akademik dhe Seminar' THEN 1
        WHEN 'Gjuhë Angleze për Inxhinieri' THEN 1
        WHEN 'Matematikë 2' THEN 2
        WHEN 'Sistemet Operative' THEN 2
        WHEN 'Shkenca Kompjuterike 1' THEN 2
        WHEN 'Hyrje në Sigurinë e Informacionit' THEN 2
        WHEN 'Ndërveprimi Kompjuter-Njeri' THEN 2
        WHEN 'Rrjeta Kompjuterike dhe Komunikimi' THEN 2
        WHEN 'Hyrje ne Algoritme' THEN 2
        ELSE semester
    END,
    ects = CASE titulli
        WHEN 'Bazat e Inxhinierise Elektronike / Elektrike' THEN 6
        WHEN 'Shkenca Kompjuterike 1' THEN 6
        WHEN 'Gjuhë Angleze për Inxhinieri' THEN 4
        WHEN 'Hyrje në Sigurinë e Informacionit' THEN 4
        WHEN 'Hyrje ne Algoritme' THEN 4
        ELSE 5
    END
WHERE titulli IN (
    'Hyrje në Shkenca Kompjuterike dhe Programim',
    'Matematikë 1',
    'Bazat e Inxhinierise Elektronike / Elektrike',
    'Arkitektura dhe Organizimi i Kompjuterëve',
    'Shkrim Akademik dhe Seminar',
    'Gjuhë Angleze për Inxhinieri',
    'Matematikë 2',
    'Sistemet Operative',
    'Shkenca Kompjuterike 1',
    'Hyrje në Sigurinë e Informacionit',
    'Ndërveprimi Kompjuter-Njeri',
    'Rrjeta Kompjuterike dhe Komunikimi',
    'Hyrje ne Algoritme'
);

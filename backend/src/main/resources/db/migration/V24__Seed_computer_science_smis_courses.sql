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
    SELECT 'Gjuhe Italiane' AS titulli, 1 AS semester, 4 AS ects
    UNION ALL SELECT 'Sisteme dhe Sinjale', 4, 5
    UNION ALL SELECT 'Programimi i Lojerave', 5, 5
    UNION ALL SELECT 'DevOps', 5, 5
    UNION ALL SELECT 'Bazat e te dhenave NoSQL', 5, 5
    UNION ALL SELECT 'Sensoret dhe Aktivizuesit', 5, 5
    UNION ALL SELECT 'Programimi ne Python', 5, 5
    UNION ALL SELECT 'Menaxhimi i Projekteve dhe Ndermarresia', 5, 5
    UNION ALL SELECT 'Perpunimi Dixhital i Sinjalit', 5, 5
    UNION ALL SELECT 'Sistemet e Nderlidhura', 5, 5
    UNION ALL SELECT 'Interneti i Gjerave (IoT)', 5, 5
    UNION ALL SELECT 'Bazat e Inteligjences Artificiale', 5, 5
    UNION ALL SELECT 'Teknologjite e perzgjedhura (JavaScript Frameworks, R eti)', 5, 5
    UNION ALL SELECT 'Infrastruktura e Servereve', 5, 5
    UNION ALL SELECT 'Blockchain ne Aplikacionet Multidisiplinare', 5, 5
    UNION ALL SELECT 'Etika Kompjuterike', 6, 3
    UNION ALL SELECT 'Financimi dhe Buxhetimi', 6, 3
    UNION ALL SELECT 'Punimi i Temes se Bachelor-it', 6, 8
    UNION ALL SELECT 'Psikologjia ne Projektet Inxhinierike', 6, 3
    UNION ALL SELECT 'Hyrje ne Ekonomine Inxhinierike', 6, 3
    UNION ALL SELECT 'Lenda Laboratorike 2 (Projekt Grupor)', 6, 5
    UNION ALL SELECT 'Metodat e Analizes Ekonomike', 6, 3
    UNION ALL SELECT 'Cloud Computing', 6, 4
    UNION ALL SELECT 'Orientimi ne Karriere - Komunikim dhe Zhvillim', 6, 3
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
        WHEN 'Gjuhe Italiane' THEN 1
        WHEN 'Sisteme dhe Sinjale' THEN 4
        WHEN 'Programimi i Lojerave' THEN 5
        WHEN 'DevOps' THEN 5
        WHEN 'Bazat e te dhenave NoSQL' THEN 5
        WHEN 'Sensoret dhe Aktivizuesit' THEN 5
        WHEN 'Programimi ne Python' THEN 5
        WHEN 'Menaxhimi i Projekteve dhe Ndermarresia' THEN 5
        WHEN 'Perpunimi Dixhital i Sinjalit' THEN 5
        WHEN 'Sistemet e Nderlidhura' THEN 5
        WHEN 'Interneti i Gjerave (IoT)' THEN 5
        WHEN 'Bazat e Inteligjences Artificiale' THEN 5
        WHEN 'Teknologjite e perzgjedhura (JavaScript Frameworks, R eti)' THEN 5
        WHEN 'Infrastruktura e Servereve' THEN 5
        WHEN 'Blockchain ne Aplikacionet Multidisiplinare' THEN 5
        WHEN 'Etika Kompjuterike' THEN 6
        WHEN 'Financimi dhe Buxhetimi' THEN 6
        WHEN 'Punimi i Temes se Bachelor-it' THEN 6
        WHEN 'Psikologjia ne Projektet Inxhinierike' THEN 6
        WHEN 'Hyrje ne Ekonomine Inxhinierike' THEN 6
        WHEN 'Lenda Laboratorike 2 (Projekt Grupor)' THEN 6
        WHEN 'Metodat e Analizes Ekonomike' THEN 6
        WHEN 'Cloud Computing' THEN 6
        WHEN 'Orientimi ne Karriere - Komunikim dhe Zhvillim' THEN 6
        ELSE semester
    END,
    ects = CASE titulli
        WHEN 'Gjuhe Italiane' THEN 4
        WHEN 'Punimi i Temes se Bachelor-it' THEN 8
        WHEN 'Etika Kompjuterike' THEN 3
        WHEN 'Financimi dhe Buxhetimi' THEN 3
        WHEN 'Psikologjia ne Projektet Inxhinierike' THEN 3
        WHEN 'Hyrje ne Ekonomine Inxhinierike' THEN 3
        WHEN 'Metodat e Analizes Ekonomike' THEN 3
        WHEN 'Orientimi ne Karriere - Komunikim dhe Zhvillim' THEN 3
        WHEN 'Cloud Computing' THEN 4
        ELSE 5
    END
WHERE titulli IN (
    'Gjuhe Italiane',
    'Sisteme dhe Sinjale',
    'Programimi i Lojerave',
    'DevOps',
    'Bazat e te dhenave NoSQL',
    'Sensoret dhe Aktivizuesit',
    'Programimi ne Python',
    'Menaxhimi i Projekteve dhe Ndermarresia',
    'Perpunimi Dixhital i Sinjalit',
    'Sistemet e Nderlidhura',
    'Interneti i Gjerave (IoT)',
    'Bazat e Inteligjences Artificiale',
    'Teknologjite e perzgjedhura (JavaScript Frameworks, R eti)',
    'Infrastruktura e Servereve',
    'Blockchain ne Aplikacionet Multidisiplinare',
    'Etika Kompjuterike',
    'Financimi dhe Buxhetimi',
    'Punimi i Temes se Bachelor-it',
    'Psikologjia ne Projektet Inxhinierike',
    'Hyrje ne Ekonomine Inxhinierike',
    'Lenda Laboratorike 2 (Projekt Grupor)',
    'Metodat e Analizes Ekonomike',
    'Cloud Computing',
    'Orientimi ne Karriere - Komunikim dhe Zhvillim'
);

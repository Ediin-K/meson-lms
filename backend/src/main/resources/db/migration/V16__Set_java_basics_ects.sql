-- Java Basics: 4 ECTS
UPDATE courses SET ects = 4
WHERE LOWER(TRIM(titulli)) IN ('java basics', 'java basic', 'bazat e java', 'java bazike')
   OR LOWER(titulli) LIKE '%java basics%'
   OR LOWER(titulli) LIKE '%java basic%'
   OR LOWER(titulli) LIKE '%java baz%'
   OR LOWER(titulli) LIKE '%bazat e java%'
   OR (LOWER(titulli) LIKE '%java%' AND LOWER(titulli) LIKE '%basic%')
   OR (LOWER(titulli) LIKE '%java%' AND LOWER(titulli) LIKE '%baz%');

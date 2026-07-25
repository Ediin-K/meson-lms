-- Adds a real course-code column to subjects, replacing the hardcoded
-- catalog list that previously lived in SmisService.java. Existing subjects
-- that match the old catalog are backfilled with their known code; new
-- subjects and subjects with no catalog match are left NULL and keep
-- falling back to a generated "MESONxxx" code.

ALTER TABLE subjects ADD COLUMN code VARCHAR(20) NULL;

UPDATE subjects SET code = '40ICP101' WHERE LOWER(TRIM(title)) = LOWER('Hyrje në Shkenca Kompjuterike dhe Programim');
UPDATE subjects SET code = '40MAT102' WHERE LOWER(TRIM(title)) = LOWER('Matematikë 1');
UPDATE subjects SET code = '40FEE103' WHERE LOWER(TRIM(title)) = LOWER('Bazat e Inxhinierise Elektronike / Elektrike');
UPDATE subjects SET code = '40CAO104' WHERE LOWER(TRIM(title)) = LOWER('Arkitektura dhe Organizimi i Kompjuterëve');
UPDATE subjects SET code = '40AWS105' WHERE LOWER(TRIM(title)) = LOWER('Shkrim Akademik dhe Seminar');
UPDATE subjects SET code = '40ENG106' WHERE LOWER(TRIM(title)) = LOWER('Gjuhë Angleze për Inxhinieri');
UPDATE subjects SET code = '40ITA107' WHERE LOWER(TRIM(title)) = LOWER('Gjuhe Italiane');
UPDATE subjects SET code = '40MAT151' WHERE LOWER(TRIM(title)) = LOWER('Matematikë 2');
UPDATE subjects SET code = '40OSY152' WHERE LOWER(TRIM(title)) = LOWER('Sistemet Operative');
UPDATE subjects SET code = '40CS1150' WHERE LOWER(TRIM(title)) = LOWER('Shkenca Kompjuterike 1');
UPDATE subjects SET code = '40IIS154' WHERE LOWER(TRIM(title)) = LOWER('Hyrje në Sigurinë e Informacionit');
UPDATE subjects SET code = '40HCI155' WHERE LOWER(TRIM(title)) = LOWER('Ndërveprimi Kompjuter-Njeri');
UPDATE subjects SET code = '40CNC202' WHERE LOWER(TRIM(title)) = LOWER('Rrjeta Kompjuterike dhe Komunikimi');
UPDATE subjects SET code = '40ITA203' WHERE LOWER(TRIM(title)) = LOWER('Hyrje ne Algoritme');
UPDATE subjects SET code = '40ADS251' WHERE LOWER(TRIM(title)) = LOWER('Algoritmet dhe Strukturat e të dhënave');
UPDATE subjects SET code = '40SS253' WHERE LOWER(TRIM(title)) = LOWER('Sisteme dhe Sinjale');
UPDATE subjects SET code = '40GP304' WHERE LOWER(TRIM(title)) = LOWER('Programimi i Lojerave');
UPDATE subjects SET code = '40DEV305' WHERE LOWER(TRIM(title)) = LOWER('DevOps');
UPDATE subjects SET code = '40SQL307' WHERE LOWER(TRIM(title)) = LOWER('Bazat e te dhenave NoSQL');
UPDATE subjects SET code = '40SA310' WHERE LOWER(TRIM(title)) = LOWER('Sensoret dhe Aktivizuesit');
UPDATE subjects SET code = '40PP303' WHERE LOWER(TRIM(title)) = LOWER('Programimi ne Python');
UPDATE subjects SET code = '40MPE302' WHERE LOWER(TRIM(title)) = LOWER('Menaxhimi i Projekteve dhe Ndermarresia');
UPDATE subjects SET code = '40DSP311' WHERE LOWER(TRIM(title)) = LOWER('Perpunimi Dixhital i Sinjalit');
UPDATE subjects SET code = '40ES301' WHERE LOWER(TRIM(title)) = LOWER('Sistemet e Nderlidhura');
UPDATE subjects SET code = '40IOT309' WHERE LOWER(TRIM(title)) = LOWER('Interneti i Gjerave (IoT)');
UPDATE subjects SET code = '40LC1300' WHERE LOWER(TRIM(title)) = LOWER('Bazat e Inteligjences Artificiale');
UPDATE subjects SET code = '40STJ306' WHERE LOWER(TRIM(title)) = LOWER('Teknologjite e perzgjedhura (JavaScript Frameworks, R eti)');
UPDATE subjects SET code = '40SI308' WHERE LOWER(TRIM(title)) = LOWER('Infrastruktura e Servereve');
UPDATE subjects SET code = '40BMA312' WHERE LOWER(TRIM(title)) = LOWER('Blockchain ne Aplikacionet Multidisiplinare');
UPDATE subjects SET code = '40CE358' WHERE LOWER(TRIM(title)) = LOWER('Etika Kompjuterike');
UPDATE subjects SET code = '40FB356' WHERE LOWER(TRIM(title)) = LOWER('Financimi dhe Buxhetimi');
UPDATE subjects SET code = '40BTH352' WHERE LOWER(TRIM(title)) = LOWER('Punimi i Temes se Bachelor-it');
UPDATE subjects SET code = '40PEP354' WHERE LOWER(TRIM(title)) = LOWER('Psikologjia ne Projektet Inxhinierike');
UPDATE subjects SET code = '40IEE357' WHERE LOWER(TRIM(title)) = LOWER('Hyrje ne Ekonomine Inxhinierike');
UPDATE subjects SET code = '40LC2351' WHERE LOWER(TRIM(title)) = LOWER('Lenda Laboratorike 2 (Projekt Grupor)');
UPDATE subjects SET code = '40EAM355' WHERE LOWER(TRIM(title)) = LOWER('Metodat e Analizes Ekonomike');
UPDATE subjects SET code = '40CC350' WHERE LOWER(TRIM(title)) = LOWER('Cloud Computing');
UPDATE subjects SET code = '40OCC353' WHERE LOWER(TRIM(title)) = LOWER('Orientimi ne Karriere - Komunikim dhe Zhvillim');

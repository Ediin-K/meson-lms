-- V36: V23 was recorded as applied in flyway_schema_history but the ALTER TABLE
-- it contains (adding parent_name, date_of_birth, gender, birthplace, academic_year
-- to student_profiles) never actually landed in this database. This repairs the
-- drift by adding each column only if it's still missing.

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'student_profiles' AND column_name = 'parent_name') = 0,
    'ALTER TABLE student_profiles ADD COLUMN parent_name VARCHAR(255)',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'student_profiles' AND column_name = 'date_of_birth') = 0,
    'ALTER TABLE student_profiles ADD COLUMN date_of_birth DATE',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'student_profiles' AND column_name = 'gender') = 0,
    'ALTER TABLE student_profiles ADD COLUMN gender VARCHAR(50)',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'student_profiles' AND column_name = 'birthplace') = 0,
    'ALTER TABLE student_profiles ADD COLUMN birthplace VARCHAR(255)',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'student_profiles' AND column_name = 'academic_year') = 0,
    'ALTER TABLE student_profiles ADD COLUMN academic_year VARCHAR(50)',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Fix lesson_resources column names to match the JPA entity mapping.
-- The table was created before V3 ran, so it has old English column names.

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'lesson_resources' AND column_name = 'original_file_name') > 0,
    'ALTER TABLE lesson_resources CHANGE COLUMN original_file_name emri_origjinal VARCHAR(255) NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'lesson_resources' AND column_name = 'saved_file_name') > 0,
    'ALTER TABLE lesson_resources CHANGE COLUMN saved_file_name emri_ruajtur VARCHAR(255) NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'lesson_resources' AND column_name = 'type') > 0,
    'ALTER TABLE lesson_resources CHANGE COLUMN type tipi VARCHAR(100)',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'lesson_resources' AND column_name = 'size') > 0,
    'ALTER TABLE lesson_resources CHANGE COLUMN size madhesia BIGINT',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Enrollment key is now mandatory for every subject (self-enrollment gate).
-- Backfill any legacy subjects that were created before the key was required.
UPDATE subjects
   SET enrollment_key = CONCAT('KEY-', id)
 WHERE enrollment_key IS NULL
    OR TRIM(enrollment_key) = '';

ALTER TABLE subjects
    MODIFY COLUMN enrollment_key VARCHAR(255) NOT NULL;

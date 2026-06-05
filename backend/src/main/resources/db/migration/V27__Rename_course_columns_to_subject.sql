-- V27: Rename remaining course-named tables/columns to subject terminology
-- (V26 renamed group tables; this completes courses → subjects and course_id → subject_id)

-- Rename courses → subjects when the legacy table still exists
SET @rename_courses = IF(
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'courses') > 0
    AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'subjects') = 0,
    'RENAME TABLE courses TO subjects',
    'SELECT 1'
);
PREPARE stmt FROM @rename_courses;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename course_categories → directions when the legacy table still exists
SET @rename_categories = IF(
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'course_categories') > 0
    AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'directions') = 0,
    'RENAME TABLE course_categories TO directions',
    'SELECT 1'
);
PREPARE stmt FROM @rename_categories;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Helper: rename column when it exists
-- modules.course_id → subject_id
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'modules' AND column_name = 'course_id') > 0,
    'ALTER TABLE modules CHANGE COLUMN course_id subject_id BIGINT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- enrollments
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enrollments' AND column_name = 'course_id') > 0,
    'ALTER TABLE enrollments CHANGE COLUMN course_id subject_id BIGINT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enrollments' AND column_name = 'course_group_id') > 0,
    'ALTER TABLE enrollments CHANGE COLUMN course_group_id subject_group_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enrollments' AND column_name = 'course_subgroup_id') > 0,
    'ALTER TABLE enrollments CHANGE COLUMN course_subgroup_id subject_subgroup_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- grades
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'grades' AND column_name = 'course_id') > 0,
    'ALTER TABLE grades CHANGE COLUMN course_id subject_id BIGINT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- schedule_sessions
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'schedule_sessions' AND column_name = 'course_id') > 0,
    'ALTER TABLE schedule_sessions CHANGE COLUMN course_id subject_id BIGINT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'schedule_sessions' AND column_name = 'course_group_id') > 0,
    'ALTER TABLE schedule_sessions CHANGE COLUMN course_group_id subject_group_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'schedule_sessions' AND column_name = 'course_subgroup_id') > 0,
    'ALTER TABLE schedule_sessions CHANGE COLUMN course_subgroup_id subject_subgroup_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- subject_groups (renamed from course_groups in V26)
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject_groups' AND column_name = 'course_id') > 0,
    'ALTER TABLE subject_groups CHANGE COLUMN course_id subject_id BIGINT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- subject_subgroups
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject_subgroups' AND column_name = 'course_group_id') > 0,
    'ALTER TABLE subject_subgroups CHANGE COLUMN course_group_id subject_group_id BIGINT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- subject_group_teachers
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject_group_teachers' AND column_name = 'course_group_id') > 0,
    'ALTER TABLE subject_group_teachers CHANGE COLUMN course_group_id subject_group_id BIGINT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- subject_subgroup_teachers
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject_subgroup_teachers' AND column_name = 'course_subgroup_id') > 0,
    'ALTER TABLE subject_subgroup_teachers CHANGE COLUMN course_subgroup_id subject_subgroup_id BIGINT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

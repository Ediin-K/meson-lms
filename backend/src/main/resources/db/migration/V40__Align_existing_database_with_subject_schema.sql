-- Align older Meson LMS databases with the current subject/department schema.
-- Some local databases already used migration versions 26-31 for SMIS seed data,
-- so the rename migrations with those version numbers never ran there.

-- users
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'emri') > 0,
    'ALTER TABLE users CHANGE COLUMN emri first_name VARCHAR(255) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'mbiemri') > 0,
    'ALTER TABLE users CHANGE COLUMN mbiemri last_name VARCHAR(255) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'data_krijimit') > 0,
    'ALTER TABLE users CHANGE COLUMN data_krijimit created_at DATETIME NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'statusi') > 0,
    'ALTER TABLE users CHANGE COLUMN statusi status VARCHAR(50) NOT NULL DEFAULT ''active''',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- roles
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'roles' AND column_name = 'emertimi') > 0,
    'ALTER TABLE roles CHANGE COLUMN emertimi name VARCHAR(255) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'roles' AND column_name = 'pershkrimi') > 0,
    'ALTER TABLE roles CHANGE COLUMN pershkrimi description TEXT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- course category -> department
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'course_categories') > 0
    AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'departments') = 0,
    'RENAME TABLE course_categories TO departments',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'departments' AND column_name = 'emertimi') > 0,
    'ALTER TABLE departments CHANGE COLUMN emertimi name VARCHAR(255) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'departments' AND column_name = 'pershkrimi') > 0,
    'ALTER TABLE departments CHANGE COLUMN pershkrimi description TEXT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'departments' AND column_name = 'num_semesters') = 0,
    'ALTER TABLE departments ADD COLUMN num_semesters INT NOT NULL DEFAULT 8',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- courses -> subjects
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'courses') > 0
    AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'subjects') = 0,
    'RENAME TABLE courses TO subjects',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND table_name = 'subjects' AND constraint_name = 'courses_niveli_check') > 0,
    'ALTER TABLE subjects DROP CHECK courses_niveli_check',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND table_name = 'subjects' AND constraint_name = 'courses_statusi_check') > 0,
    'ALTER TABLE subjects DROP CHECK courses_statusi_check',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subjects' AND column_name = 'titulli') > 0,
    'ALTER TABLE subjects CHANGE COLUMN titulli title VARCHAR(255) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subjects' AND column_name = 'pershkrimi') > 0,
    'ALTER TABLE subjects CHANGE COLUMN pershkrimi description VARCHAR(255) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subjects' AND column_name = 'category_id') > 0,
    'ALTER TABLE subjects CHANGE COLUMN category_id department_id BIGINT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subjects' AND column_name = 'niveli') > 0,
    'ALTER TABLE subjects CHANGE COLUMN niveli level VARCHAR(50) NOT NULL DEFAULT ''FILLESTAR''',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subjects' AND column_name = 'statusi') > 0,
    'ALTER TABLE subjects CHANGE COLUMN statusi status VARCHAR(50) NOT NULL DEFAULT ''DRAFT''',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- modules
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'modules' AND column_name = 'titulli') > 0,
    'ALTER TABLE modules CHANGE COLUMN titulli title VARCHAR(255) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'modules' AND column_name = 'pershkrimi') > 0,
    'ALTER TABLE modules CHANGE COLUMN pershkrimi description VARCHAR(255) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'modules' AND column_name = 'rradhitja') > 0,
    'ALTER TABLE modules CHANGE COLUMN rradhitja sequence_order INT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'modules' AND column_name = 'course_id') > 0,
    'ALTER TABLE modules CHANGE COLUMN course_id subject_id BIGINT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- lessons
SET @sql = IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND table_name = 'lessons' AND constraint_name = 'lessons_lloji_check') > 0,
    'ALTER TABLE lessons DROP CHECK lessons_lloji_check',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'lessons' AND column_name = 'titulli') > 0,
    'ALTER TABLE lessons CHANGE COLUMN titulli title VARCHAR(255) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'lessons' AND column_name = 'permbajtja') > 0,
    'ALTER TABLE lessons CHANGE COLUMN permbajtja content TEXT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'lessons' AND column_name = 'lloji') > 0,
    'ALTER TABLE lessons CHANGE COLUMN lloji type VARCHAR(50) NOT NULL DEFAULT ''TEKST''',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'lessons' AND column_name = 'rradhitja') > 0,
    'ALTER TABLE lessons CHANGE COLUMN rradhitja sequence_order INT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- quizzes
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'quizzes' AND column_name = 'titulli') > 0,
    'ALTER TABLE quizzes CHANGE COLUMN titulli title VARCHAR(255) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'quizzes' AND column_name = 'pershkrimi') > 0,
    'ALTER TABLE quizzes CHANGE COLUMN pershkrimi description TEXT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'quizzes' AND column_name = 'kohezgjatja_minuta') > 0,
    'ALTER TABLE quizzes CHANGE COLUMN kohezgjatja_minuta duration_minutes INT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- quiz questions and attempts
SET @sql = IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND table_name = 'quiz_questions' AND constraint_name = 'quiz_questions_lloji_check') > 0,
    'ALTER TABLE quiz_questions DROP CHECK quiz_questions_lloji_check',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'quiz_questions' AND column_name = 'pyetja') > 0,
    'ALTER TABLE quiz_questions CHANGE COLUMN pyetja question TEXT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'quiz_questions' AND column_name = 'lloji') > 0,
    'ALTER TABLE quiz_questions CHANGE COLUMN lloji type VARCHAR(50) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'quiz_questions' AND column_name = 'rradhitja') > 0,
    'ALTER TABLE quiz_questions CHANGE COLUMN rradhitja sequence_order INT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'quiz_questions' AND column_name = 'pikete') > 0,
    'ALTER TABLE quiz_questions CHANGE COLUMN pikete points INT NOT NULL DEFAULT 1',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'quiz_answers' AND column_name = 'pergjigja') > 0,
    'ALTER TABLE quiz_answers CHANGE COLUMN pergjigja answer VARCHAR(255) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'quiz_answers' AND column_name = 'eshte_sakte') > 0,
    'ALTER TABLE quiz_answers CHANGE COLUMN eshte_sakte is_correct BOOLEAN NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'quiz_attempts' AND column_name = 'pikete') > 0,
    'ALTER TABLE quiz_attempts CHANGE COLUMN pikete points DOUBLE NOT NULL DEFAULT 0',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'quiz_attempts' AND column_name = 'koha_sekondat') > 0,
    'ALTER TABLE quiz_attempts CHANGE COLUMN koha_sekondat time_seconds INT NOT NULL DEFAULT 0',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'quiz_attempts' AND column_name = 'data') > 0,
    'ALTER TABLE quiz_attempts CHANGE COLUMN data attempt_date DATETIME NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- enrollments, grades, exams, schedule
SET @sql = IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND table_name = 'enrollments' AND constraint_name = 'enrollments_statusi_check') > 0,
    'ALTER TABLE enrollments DROP CHECK enrollments_statusi_check',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enrollments' AND column_name = 'course_id') > 0,
    'ALTER TABLE enrollments CHANGE COLUMN course_id subject_id BIGINT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enrollments' AND column_name = 'course_group_id') > 0,
    'ALTER TABLE enrollments CHANGE COLUMN course_group_id subject_group_id BIGINT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enrollments' AND column_name = 'course_subgroup_id') > 0,
    'ALTER TABLE enrollments CHANGE COLUMN course_subgroup_id subject_subgroup_id BIGINT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enrollments' AND column_name = 'progresi') > 0,
    'ALTER TABLE enrollments CHANGE COLUMN progresi progress DOUBLE NULL DEFAULT 0',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enrollments' AND column_name = 'statusi') > 0,
    'ALTER TABLE enrollments CHANGE COLUMN statusi status VARCHAR(50) NOT NULL DEFAULT ''AKTIV''',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'enrollments' AND column_name = 'data_regjistrimit') > 0,
    'ALTER TABLE enrollments CHANGE COLUMN data_regjistrimit enrollment_date DATETIME NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'grades' AND column_name = 'course_id') > 0,
    'ALTER TABLE grades CHANGE COLUMN course_id subject_id BIGINT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'exam_applications' AND column_name = 'course_id') > 0,
    'ALTER TABLE exam_applications CHANGE COLUMN course_id subject_id BIGINT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'schedule_sessions' AND column_name = 'course_id') > 0,
    'ALTER TABLE schedule_sessions CHANGE COLUMN course_id subject_id BIGINT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'schedule_sessions' AND column_name = 'course_group_id') > 0,
    'ALTER TABLE schedule_sessions CHANGE COLUMN course_group_id subject_group_id BIGINT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'schedule_sessions' AND column_name = 'course_subgroup_id') > 0,
    'ALTER TABLE schedule_sessions CHANGE COLUMN course_subgroup_id subject_subgroup_id BIGINT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- groups
SET @sql = IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'course_groups') > 0
    AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'subject_groups') = 0,
    'RENAME TABLE course_groups TO subject_groups',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'course_subgroups') > 0
    AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'subject_subgroups') = 0,
    'RENAME TABLE course_subgroups TO subject_subgroups',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'course_group_teachers') > 0
    AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'subject_group_teachers') = 0,
    'RENAME TABLE course_group_teachers TO subject_group_teachers',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'course_subgroup_teachers') > 0
    AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'subject_subgroup_teachers') = 0,
    'RENAME TABLE course_subgroup_teachers TO subject_subgroup_teachers',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject_groups' AND column_name = 'course_id') > 0,
    'ALTER TABLE subject_groups CHANGE COLUMN course_id subject_id BIGINT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject_groups' AND column_name = 'direction_group_id') > 0,
    'ALTER TABLE subject_groups CHANGE COLUMN direction_group_id department_group_id BIGINT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject_subgroups' AND column_name = 'course_group_id') > 0,
    'ALTER TABLE subject_subgroups CHANGE COLUMN course_group_id subject_group_id BIGINT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject_group_teachers' AND column_name = 'course_group_id') > 0,
    'ALTER TABLE subject_group_teachers CHANGE COLUMN course_group_id subject_group_id BIGINT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject_subgroup_teachers' AND column_name = 'course_subgroup_id') > 0,
    'ALTER TABLE subject_subgroup_teachers CHANGE COLUMN course_subgroup_id subject_subgroup_id BIGINT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- department groups and student profile/request references
SET @sql = IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'direction_groups') > 0
    AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'department_groups') = 0,
    'RENAME TABLE direction_groups TO department_groups',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'department_groups' AND column_name = 'category_id') > 0,
    'ALTER TABLE department_groups CHANGE COLUMN category_id department_id BIGINT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'student_profiles' AND column_name = 'category_id') > 0,
    'ALTER TABLE student_profiles CHANGE COLUMN category_id department_id BIGINT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'student_profiles' AND column_name = 'approved_direction_group_id') > 0,
    'ALTER TABLE student_profiles CHANGE COLUMN approved_direction_group_id approved_department_group_id BIGINT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'student_group_requests' AND column_name = 'direction_group_id') > 0,
    'ALTER TABLE student_group_requests CHANGE COLUMN direction_group_id department_group_id BIGINT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'student_group_selections' AND column_name = 'direction_group_id') > 0,
    'ALTER TABLE student_group_selections CHANGE COLUMN direction_group_id department_group_id BIGINT NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- certificates
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'certificates' AND column_name = 'data_leshimit') > 0,
    'ALTER TABLE certificates CHANGE COLUMN data_leshimit issued_date DATETIME NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'certificates' AND column_name = 'kodi_unik') > 0,
    'ALTER TABLE certificates CHANGE COLUMN kodi_unik unique_code VARCHAR(255) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

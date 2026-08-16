-- V23's real content never ran against this database: the version-23 slot in
-- flyway_schema_history was already occupied by older content from before a
-- migration renumbering, so V23__Create_smis_exam_applications.sql has been
-- silently skipped ever since. V36 already repaired that file's student_profiles
-- column additions in isolation; this repairs the other half it also contained
-- -- the exam_applications table itself -- which the SMIS exam feature has
-- depended on the whole time without it actually existing.

CREATE TABLE IF NOT EXISTS exam_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    professor_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REGISTERED',
    applied_at DATETIME NOT NULL,
    grade_id BIGINT UNIQUE,
    grade_assigned_at DATETIME,
    rejected_at DATETIME,
    cancelled_at DATETIME,
    CONSTRAINT exam_app_status_check CHECK (status IN ('REGISTERED', 'GRADED', 'REFUSED', 'CANCELLED')),
    CONSTRAINT exam_app_student_fk FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT exam_app_course_fk FOREIGN KEY (course_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT exam_app_professor_fk FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT exam_app_grade_fk FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_exam_app_student ON exam_applications(student_id);
CREATE INDEX idx_exam_app_course ON exam_applications(course_id);
CREATE INDEX idx_exam_app_professor ON exam_applications(professor_id);
CREATE INDEX idx_exam_app_status ON exam_applications(status);

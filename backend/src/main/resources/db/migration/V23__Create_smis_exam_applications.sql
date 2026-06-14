ALTER TABLE student_profiles
    ADD COLUMN parent_name VARCHAR(255),
    ADD COLUMN date_of_birth DATE,
    ADD COLUMN gender VARCHAR(50),
    ADD COLUMN birthplace VARCHAR(255),
    ADD COLUMN academic_year VARCHAR(50);

CREATE TABLE exam_applications (
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
    CONSTRAINT exam_app_course_fk FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT exam_app_professor_fk FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT exam_app_grade_fk FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_exam_app_student ON exam_applications(student_id);
CREATE INDEX idx_exam_app_course ON exam_applications(course_id);
CREATE INDEX idx_exam_app_professor ON exam_applications(professor_id);
CREATE INDEX idx_exam_app_status ON exam_applications(status);

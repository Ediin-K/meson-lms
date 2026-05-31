-- Drop old assignment tables and rebuild from scratch
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS assignments;

CREATE TABLE assignments (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    description TEXT,
    deadline   DATETIME NOT NULL,
    attachment_path VARCHAR(500),
    attachment_name VARCHAR(255),
    lesson_id  BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT assignments_lesson_fk FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE assignment_submissions (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    student_id    BIGINT NOT NULL,
    file_path     VARCHAR(500) NOT NULL,
    file_name     VARCHAR(255) NOT NULL,
    submitted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_assignment_student (assignment_id, student_id),
    CONSTRAINT sub_assignment_fk FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE CASCADE,
    CONSTRAINT sub_student_fk    FOREIGN KEY (student_id)    REFERENCES users (id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_assignments_lesson_id              ON assignments (lesson_id);
CREATE INDEX idx_assignment_submissions_assignment  ON assignment_submissions (assignment_id);
CREATE INDEX idx_assignment_submissions_student     ON assignment_submissions (student_id);

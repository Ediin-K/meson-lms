CREATE TABLE lesson_progress (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT   NOT NULL,
    lesson_id  BIGINT   NOT NULL,
    viewed_at  DATETIME NOT NULL,
    UNIQUE KEY uq_student_lesson (student_id, lesson_id),
    CONSTRAINT fk_lp_student FOREIGN KEY (student_id) REFERENCES users   (id) ON DELETE CASCADE,
    CONSTRAINT fk_lp_lesson  FOREIGN KEY (lesson_id)  REFERENCES lessons (id) ON DELETE CASCADE
);

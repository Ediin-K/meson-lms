CREATE TABLE subject_teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_subject_teacher_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_subject_teacher_teacher FOREIGN KEY (teacher_id) REFERENCES users(id),
    CONSTRAINT uq_subject_teacher UNIQUE (subject_id, teacher_id)
);

CREATE INDEX idx_subject_teacher_teacher ON subject_teachers(teacher_id);

-- Every existing subject's current teacher becomes its first (primary) entry.
INSERT INTO subject_teachers (subject_id, teacher_id, sort_order)
SELECT id, teacher_id, 0 FROM subjects;

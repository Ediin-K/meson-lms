CREATE TABLE assistant_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assistant_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    review_date DATE NULL,
    stars TINYINT NULL,
    comment TEXT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_assistant_review_assistant FOREIGN KEY (assistant_id) REFERENCES users(id),
    CONSTRAINT fk_assistant_review_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_assistant_review_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE INDEX idx_assistant_review_lookup ON assistant_reviews(assistant_id, subject_id, student_id, review_date);
CREATE INDEX idx_assistant_review_subject_student ON assistant_reviews(subject_id, student_id);

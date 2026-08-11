-- Audit trail for grade changes. gradeId is not a foreign key on purpose: grade rows
-- are hard-deleted, and the whole point of an audit log is to survive that deletion.
CREATE TABLE grade_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grade_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    subject_id BIGINT NOT NULL,
    subject_titulli VARCHAR(255) NOT NULL,
    performed_by_id BIGINT NOT NULL,
    performed_by_name VARCHAR(255) NOT NULL,
    action VARCHAR(20) NOT NULL,
    previous_grade INT NULL,
    new_grade INT NULL,
    comment TEXT NULL,
    performed_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_grade_audit_logs_grade_id ON grade_audit_logs(grade_id);
CREATE INDEX idx_grade_audit_logs_subject_id ON grade_audit_logs(subject_id);

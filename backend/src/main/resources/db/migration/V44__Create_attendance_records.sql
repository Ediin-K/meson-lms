CREATE TABLE attendance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    schedule_session_id BIGINT NOT NULL,
    session_date DATE NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    marked_by_id BIGINT NOT NULL,
    marked_at TIMESTAMP NOT NULL,
    comment TEXT NULL,
    CONSTRAINT fk_attendance_schedule_session FOREIGN KEY (schedule_session_id) REFERENCES schedule_sessions(id),
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_attendance_marked_by FOREIGN KEY (marked_by_id) REFERENCES users(id),
    CONSTRAINT uq_attendance_session_date_student UNIQUE (schedule_session_id, session_date, student_id)
);

CREATE INDEX idx_attendance_student_id ON attendance_records(student_id);

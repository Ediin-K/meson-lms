-- Academic terms: gate enrollment and exam-application windows.
-- Only one term is expected to be active at a time (enforced in the service layer).
CREATE TABLE academic_terms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    enrollment_start TIMESTAMP NOT NULL,
    enrollment_end TIMESTAMP NOT NULL,
    exam_application_start TIMESTAMP NOT NULL,
    exam_application_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
);

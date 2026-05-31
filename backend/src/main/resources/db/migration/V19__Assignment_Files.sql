ALTER TABLE assignments
    ADD COLUMN attachment_path VARCHAR(500) NULL,
    ADD COLUMN attachment_name VARCHAR(255) NULL;

ALTER TABLE assignment_submissions
    ADD COLUMN submission_file_path VARCHAR(500) NULL,
    ADD COLUMN submission_file_name VARCHAR(255) NULL;

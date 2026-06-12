-- Submission workflow: late flag, first-submission audit timestamp, grade & feedback
ALTER TABLE assignment_submissions ADD COLUMN is_late BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE assignment_submissions ADD COLUMN first_submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE assignment_submissions ADD COLUMN grade DECIMAL(5,2) NULL;
ALTER TABLE assignment_submissions ADD COLUMN feedback TEXT NULL;
ALTER TABLE assignment_submissions ADD COLUMN graded_at DATETIME NULL;

-- Backfill audit timestamp for existing rows
UPDATE assignment_submissions SET first_submitted_at = submitted_at;

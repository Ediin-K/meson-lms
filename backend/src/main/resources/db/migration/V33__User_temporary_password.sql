-- Temporary-password flow: admin-created users must change their password on first login
ALTER TABLE users ADD COLUMN temporary_password BOOLEAN NOT NULL DEFAULT FALSE;

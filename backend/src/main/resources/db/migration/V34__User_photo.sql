-- Avatar/profile photo for every user (any role)
ALTER TABLE users ADD COLUMN photo_path VARCHAR(500) NULL;

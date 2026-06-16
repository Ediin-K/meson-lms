SET @has_photo_path := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'photo_path'
);

SET @add_photo_path := IF(
    @has_photo_path = 0,
    'ALTER TABLE users ADD COLUMN photo_path VARCHAR(500) NULL',
    'SELECT 1'
);

PREPARE add_photo_path_stmt FROM @add_photo_path;
EXECUTE add_photo_path_stmt;
DEALLOCATE PREPARE add_photo_path_stmt;

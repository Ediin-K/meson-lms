-- Lockout expiry timestamp for login rate limiting; null means not locked
ALTER TABLE users ADD COLUMN locked_until TIMESTAMP NULL;

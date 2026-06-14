INSERT INTO roles (name, description, normalized_name)
SELECT 'teacher', 'Profesor / Staf akademik', 'TEACHER'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE normalized_name = 'TEACHER'
);

INSERT INTO users (
    first_name,
    last_name,
    email,
    password_hash,
    phone_number,
    email_confirmed,
    lockout_enabled,
    access_failed_count,
    created_at,
    status,
    temporary_password
)
SELECT 'Raffaela',
       'Vespuci',
       'raffaela.vespuci@meson.com',
       '$2a$10$zKsTK3YVU36/1CYs48Y6AuTG8g02wwtpSTLdVjX7r3dveF31piUXW',
       NULL,
       TRUE,
       FALSE,
       0,
       CURRENT_TIMESTAMP,
       'active',
       FALSE
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'raffaela.vespuci@meson.com'
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.normalized_name = 'TEACHER'
WHERE u.email = 'raffaela.vespuci@meson.com'
AND NOT EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = u.id
      AND ur.role_id = r.id
);

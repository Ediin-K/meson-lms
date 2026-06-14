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
SELECT seed.first_name,
       seed.last_name,
       seed.email,
       '$2a$10$zKsTK3YVU36/1CYs48Y6AuTG8g02wwtpSTLdVjX7r3dveF31piUXW',
       NULL,
       TRUE,
       FALSE,
       0,
       CURRENT_TIMESTAMP,
       'active',
       FALSE
FROM (
    SELECT 'Astrit' AS first_name, 'Hulaj' AS last_name, 'astrit.hulaj@meson.com' AS email
    UNION ALL SELECT 'N/A.SHKI -', 'Komision per Transfer', 'komision.transfer@meson.com'
    UNION ALL SELECT 'Osman', 'Osmani', 'osman.osmani@meson.com'
    UNION ALL SELECT 'Alma', 'Novoberdaliu', 'alma.novoberdaliu@meson.com'
    UNION ALL SELECT 'Liridon', 'Hoti', 'liridon.hoti@meson.com'
    UNION ALL SELECT 'Elissa', 'Mollakuqe', 'elissa.mollakuqe@meson.com'
    UNION ALL SELECT 'Anita', 'Sadikaj', 'anita.sadikaj@meson.com'
    UNION ALL SELECT 'Anton', 'Gojani', 'anton.gojani@meson.com'
    UNION ALL SELECT 'Zejnije', 'Bytyqi', 'zejnije.bytyqi@meson.com'
) seed
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE users.email = seed.email
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.normalized_name = 'TEACHER'
WHERE u.email IN (
    'astrit.hulaj@meson.com',
    'komision.transfer@meson.com',
    'osman.osmani@meson.com',
    'alma.novoberdaliu@meson.com',
    'liridon.hoti@meson.com',
    'elissa.mollakuqe@meson.com',
    'anita.sadikaj@meson.com',
    'anton.gojani@meson.com',
    'zejnije.bytyqi@meson.com'
)
AND NOT EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = u.id
      AND ur.role_id = r.id
);

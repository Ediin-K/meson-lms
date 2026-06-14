-- Rename directions -> departments, direction_groups -> department_groups
-- and rename category_id / direction_group_id columns accordingly

-- 1. Rename the directions table
ALTER TABLE directions RENAME TO departments;

-- 2. Rename the direction_groups table
ALTER TABLE direction_groups RENAME TO department_groups;

-- 3. Rename category_id -> department_id in department_groups
ALTER TABLE department_groups RENAME COLUMN category_id TO department_id;

-- 4. Rename category_id -> department_id in subjects
ALTER TABLE subjects RENAME COLUMN category_id TO department_id;

-- 5. Rename category_id -> department_id in student_profiles
ALTER TABLE student_profiles RENAME COLUMN category_id TO department_id;

-- 6. Rename approved_direction_group_id -> approved_department_group_id in student_profiles
ALTER TABLE student_profiles RENAME COLUMN approved_direction_group_id TO approved_department_group_id;

-- 7. Rename direction_group_id -> department_group_id in subject_groups
ALTER TABLE subject_groups RENAME COLUMN direction_group_id TO department_group_id;

-- 8. Rename direction_group_id -> department_group_id in student_group_requests
ALTER TABLE student_group_requests RENAME COLUMN direction_group_id TO department_group_id;

-- 9. Rename direction_group_id -> department_group_id in student_group_selections
ALTER TABLE student_group_selections RENAME COLUMN direction_group_id TO department_group_id;

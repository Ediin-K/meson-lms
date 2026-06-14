-- V26: Rename remaining course_* group tables to subject_* tables
-- courses→subjects and course_categories→directions already done in V23

-- Rename course_groups → subject_groups
RENAME TABLE course_groups TO subject_groups;

-- Rename course_subgroups → subject_subgroups
RENAME TABLE course_subgroups TO subject_subgroups;

-- Rename course_group_teachers → subject_group_teachers
RENAME TABLE course_group_teachers TO subject_group_teachers;

-- Rename course_subgroup_teachers → subject_subgroup_teachers
RENAME TABLE course_subgroup_teachers TO subject_subgroup_teachers;

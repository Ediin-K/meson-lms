-- Enforce 1-to-1: one assignment per ASSIGNMENT-type lesson
ALTER TABLE assignments ADD UNIQUE KEY uq_assignment_lesson (lesson_id);

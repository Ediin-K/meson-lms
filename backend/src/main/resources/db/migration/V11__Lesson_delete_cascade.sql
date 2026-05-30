-- Adds ON DELETE CASCADE to FK constraints so deleting a lesson/quiz
-- automatically cleans up all child records (quizzes, questions, attempts, etc.)

-- quizzes.lesson_id -> lessons.id
ALTER TABLE quizzes DROP FOREIGN KEY quizzes_lesson_fk;
ALTER TABLE quizzes
    ADD CONSTRAINT quizzes_lesson_fk
    FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE;

-- assignments.lesson_id -> lessons.id
ALTER TABLE assignments DROP FOREIGN KEY assignments_lesson_fk;
ALTER TABLE assignments
    ADD CONSTRAINT assignments_lesson_fk
    FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE;

-- quiz_questions.quiz_id -> quizzes.id
ALTER TABLE quiz_questions DROP FOREIGN KEY quiz_questions_quiz_fk;
ALTER TABLE quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_fk
    FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE;

-- quiz_attempts.quiz_id -> quizzes.id
ALTER TABLE quiz_attempts DROP FOREIGN KEY quiz_attempts_quiz_fk;
ALTER TABLE quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_fk
    FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE;

-- quiz_answers.question_id -> quiz_questions.id
ALTER TABLE quiz_answers DROP FOREIGN KEY quiz_answers_question_fk;
ALTER TABLE quiz_answers
    ADD CONSTRAINT quiz_answers_question_fk
    FOREIGN KEY (question_id) REFERENCES quiz_questions (id) ON DELETE CASCADE;

-- assignment_submissions.assignment_id -> assignments.id
ALTER TABLE assignment_submissions DROP FOREIGN KEY assignment_submissions_assignment_fk;
ALTER TABLE assignment_submissions
    ADD CONSTRAINT assignment_submissions_assignment_fk
    FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE CASCADE;

-- answer_submissions.attempt_id -> quiz_attempts.id
ALTER TABLE answer_submissions DROP FOREIGN KEY answer_submissions_attempt_fk;
ALTER TABLE answer_submissions
    ADD CONSTRAINT answer_submissions_attempt_fk
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts (id) ON DELETE CASCADE;

-- answer_submissions.question_id -> quiz_questions.id
ALTER TABLE answer_submissions DROP FOREIGN KEY answer_submissions_question_fk;
ALTER TABLE answer_submissions
    ADD CONSTRAINT answer_submissions_question_fk
    FOREIGN KEY (question_id) REFERENCES quiz_questions (id) ON DELETE CASCADE;

-- answer_submissions.answer_id -> quiz_answers.id
ALTER TABLE answer_submissions DROP FOREIGN KEY answer_submissions_answer_fk;
ALTER TABLE answer_submissions
    ADD CONSTRAINT answer_submissions_answer_fk
    FOREIGN KEY (answer_id) REFERENCES quiz_answers (id) ON DELETE CASCADE;

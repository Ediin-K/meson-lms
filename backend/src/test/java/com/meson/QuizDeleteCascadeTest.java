package com.meson;

import com.meson.entity.*;
import com.meson.entity.Module;
import com.meson.repository.*;
import com.meson.service.QuizService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/** Deleting a quiz must also remove its student attempts (so they stop showing on the profile). */
@SpringBootTest
@ActiveProfiles("test")
class QuizDeleteCascadeTest {

    @Autowired QuizService quizService;
    @Autowired QuizRepository quizRepository;
    @Autowired QuizAttemptRepository attemptRepository;
    @Autowired UserRepository userRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired ModuleRepository moduleRepository;
    @Autowired LessonRepository lessonRepository;

    private Long quizId;
    private Long studentId;

    @BeforeEach
    void setUp() {
        attemptRepository.deleteAll();
        quizRepository.deleteAll();
        lessonRepository.deleteAll();
        moduleRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();

        User teacher = saveUser("teacher@q.com");
        User student = saveUser("student@q.com");
        studentId = student.getId();

        Subject subject = new Subject();
        subject.setTitulli("Subj"); subject.setPershkrimi("d"); subject.setTeacher(teacher);
        subject.setSemester(1); subject.setEcts(5); subject.setCreatedAt(LocalDateTime.now());
        subject = subjectRepository.save(subject);

        Module module = new Module();
        module.setTitulli("M"); module.setPershkrimi("d"); module.setRradhitja(1);
        module.setSubject(subject); module.setCreatedAt(LocalDateTime.now());
        module = moduleRepository.save(module);

        Lesson lesson = new Lesson();
        lesson.setTitulli("L"); lesson.setLloji(LessonType.QUIZ); lesson.setRradhitja(1);
        lesson.setModule(module); lesson.setCreatedAt(LocalDateTime.now());
        lesson = lessonRepository.save(lesson);

        Quiz quiz = Quiz.builder()
                .titulli("Quiz 1").pershkrimi("d").kohezgjatjaMinuta(10)
                .status(QuizStatus.ACTIVE).lesson(lesson).createdAt(LocalDateTime.now())
                .build();
        quiz = quizRepository.save(quiz);
        quizId = quiz.getId();

        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz).user(student).pikete(5.0).kohaSekondat(60)
                .startedAt(LocalDateTime.now()).expiresAt(LocalDateTime.now().plusMinutes(10))
                .submitted(true).abandoned(false)
                .build();
        attemptRepository.save(attempt);
    }

    private User saveUser(String email) {
        User u = new User();
        u.setEmri("U"); u.setMbiemri("T"); u.setEmail(email); u.setPasswordHash("x");
        return userRepository.save(u);
    }

    @Test
    void deletingQuizRemovesItsAttempts() {
        assertThat(attemptRepository.findByUserId(studentId)).hasSize(1);

        quizService.deleteQuiz(quizId);

        assertThat(quizRepository.existsById(quizId)).isFalse();
        assertThat(attemptRepository.findByQuizId(quizId)).isEmpty();
        assertThat(attemptRepository.findByUserId(studentId)).isEmpty();
    }
}

package com.meson;

import com.meson.entity.*;
import com.meson.entity.Module;
import com.meson.repository.*;
import com.meson.service.EnrollmentCompletionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies that PERFUNDUAR is strictly derived from "all current lessons viewed":
 * it auto-completes at 100%, and adding a new (13th-module-style) lesson reopens the
 * enrollment and pulls the certificate until the student views the new material.
 */
@SpringBootTest
@ActiveProfiles("test")
class CompletionDerivationTest {

    @Autowired UserRepository userRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired ModuleRepository moduleRepository;
    @Autowired LessonRepository lessonRepository;
    @Autowired EnrollmentRepository enrollmentRepository;
    @Autowired LessonProgressRepository progressRepository;
    @Autowired CertificateRepository certificateRepository;
    @Autowired EnrollmentCompletionService completionService;

    private User student;
    private Subject subject;
    private Module module;
    private Enrollment enrollment;

    @BeforeEach
    void setUp() {
        progressRepository.deleteAll();
        certificateRepository.deleteAll();
        enrollmentRepository.deleteAll();
        lessonRepository.deleteAll();
        moduleRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();

        User teacher = saveUser("teacher@c.com");
        student = saveUser("student@c.com");

        subject = new Subject();
        subject.setTitulli("Subject");
        subject.setPershkrimi("d");
        subject.setTeacher(teacher);
        subject.setSemester(1);
        subject.setEcts(5);
        subject.setCreatedAt(LocalDateTime.now());
        subject = subjectRepository.save(subject);

        module = saveModule(1);

        enrollment = new Enrollment();
        enrollment.setUser(student);
        enrollment.setSubject(subject);
        enrollment.setStatusi(EnrollmentStatus.AKTIV);
        enrollment.setDataRegjistrimit(LocalDateTime.now());
        enrollment = enrollmentRepository.save(enrollment);
    }

    private User saveUser(String email) {
        User u = new User();
        u.setEmri("U"); u.setMbiemri("T"); u.setEmail(email); u.setPasswordHash("x");
        return userRepository.save(u);
    }

    private Module saveModule(int order) {
        Module m = new Module();
        m.setTitulli("M" + order); m.setPershkrimi("d"); m.setRradhitja(order);
        m.setSubject(subject); m.setCreatedAt(LocalDateTime.now());
        return moduleRepository.save(m);
    }

    private Lesson saveLesson(Module m, int order) {
        Lesson l = new Lesson();
        l.setTitulli("L" + m.getId() + "-" + order);
        l.setLloji(LessonType.TEKST);
        l.setRradhitja(order);
        l.setModule(m);
        l.setCreatedAt(LocalDateTime.now());
        return lessonRepository.save(l);
    }

    private void view(Lesson l) {
        progressRepository.save(LessonProgress.builder()
                .student(student).lesson(l).viewedAt(LocalDateTime.now()).build());
    }

    private Enrollment reload() {
        return enrollmentRepository.findById(enrollment.getId()).orElseThrow();
    }

    @Test
    void completesOnlyWhenAllLessonsViewed_thenReopensWhenNewMaterialAdded() {
        // 3 lessons across the module; view 2 of 3 -> not complete
        Lesson l1 = saveLesson(module, 1);
        Lesson l2 = saveLesson(module, 2);
        Lesson l3 = saveLesson(module, 3);
        view(l1);
        view(l2);

        completionService.recalculateSubject(subject.getId());
        assertThat(reload().getStatusi()).isEqualTo(EnrollmentStatus.AKTIV);
        assertThat(reload().getProgresi()).isEqualTo(67.0); // round(2/3*100)
        assertThat(certificateRepository.existsByEnrollmentId(enrollment.getId())).isFalse();

        // View the last one -> 100% -> auto-complete + certificate issued
        view(l3);
        completionService.recalculateSubject(subject.getId());
        assertThat(reload().getStatusi()).isEqualTo(EnrollmentStatus.PERFUNDUAR);
        assertThat(reload().getProgresi()).isEqualTo(100.0);
        assertThat(certificateRepository.existsByEnrollmentId(enrollment.getId())).isTrue();

        // Teacher adds a NEW module + lesson (the "13th module"): student hasn't seen it
        // -> reopened to AKTIV and certificate pulled.
        Module extra = saveModule(2);
        saveLesson(extra, 1);
        completionService.recalculateSubject(subject.getId());

        assertThat(reload().getStatusi()).isEqualTo(EnrollmentStatus.AKTIV);
        assertThat(reload().getProgresi()).isEqualTo(75.0); // 3 of 4 viewed
        assertThat(certificateRepository.existsByEnrollmentId(enrollment.getId())).isFalse();
    }

    @Test
    void cancelledEnrollmentIsLeftUntouched() {
        saveLesson(module, 1);
        enrollment.setStatusi(EnrollmentStatus.ANULUAR);
        enrollmentRepository.save(enrollment);

        completionService.recalculateSubject(subject.getId());
        assertThat(reload().getStatusi()).isEqualTo(EnrollmentStatus.ANULUAR);
    }
}

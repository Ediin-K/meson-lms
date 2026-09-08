package com.meson;

import com.meson.entity.*;
import com.meson.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * UserService.delete() blocks deletion of a teacher who still owns subjects
 * (subject.teacher_id is NOT NULL), and otherwise cleans up every table that
 * references the user — including attendance_records, which FK to
 * schedule_sessions and must be cleared first.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserDeleteGuardTest {

    private static final String TEACHER_A = "udg.teachera@test.com";
    private static final String TEACHER_B = "udg.teacherb@test.com";
    private static final String STUDENT = "udg.student@test.com";
    private static final String ADMIN = "udg.admin@test.com";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired DepartmentRepository departmentRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired ScheduleSessionRepository scheduleSessionRepository;
    @Autowired AttendanceRecordRepository attendanceRecordRepository;

    private User teacherA;
    private User teacherB;
    private User student;
    private Department dept;
    private Subject subject;

    @BeforeEach
    void setUp() {
        cleanUp();
        teacherA = newUser("TeacherA", TEACHER_A);
        teacherB = newUser("TeacherB", TEACHER_B);
        student = newUser("Student", STUDENT);
        newUser("Admin", ADMIN);
        dept = newDepartment();
        subject = newSubject(teacherA, dept);
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        attendanceRecordRepository.deleteAll();
        scheduleSessionRepository.deleteAll();
        subjectRepository.findAll().stream()
                .filter(s -> s.getTitulli() != null && s.getTitulli().startsWith("UDG Subject"))
                .forEach(subjectRepository::delete);
        departmentRepository.findAll().stream()
                .filter(d -> d.getEmertimi() != null && d.getEmertimi().startsWith("UDG Dept"))
                .forEach(departmentRepository::delete);
        for (String email : new String[]{TEACHER_A, TEACHER_B, STUDENT, ADMIN}) {
            userRepository.findByEmail(email).ifPresent(userRepository::delete);
        }
    }

    private User newUser(String name, String email) {
        User u = new User();
        u.setEmri(name);
        u.setMbiemri("Test");
        u.setEmail(email);
        u.setPasswordHash("x");
        return userRepository.save(u);
    }

    private Department newDepartment() {
        Department d = new Department();
        d.setEmertimi("UDG Dept " + System.nanoTime());
        d.setPershkrimi("desc");
        d.setNumSemesters(6);
        return departmentRepository.save(d);
    }

    private Subject newSubject(User teacher, Department department) {
        Subject s = new Subject();
        s.setTitulli("UDG Subject " + System.nanoTime());
        s.setPershkrimi("desc");
        s.setTeacher(teacher);
        s.setDepartment(department);
        s.setSemester(1);
        s.setEcts(5);
        s.setCreatedAt(LocalDateTime.now());
        return subjectRepository.save(s);
    }

    private ScheduleSession newSession(User teacher) {
        return scheduleSessionRepository.save(ScheduleSession.builder()
                .subject(subject)
                .teacher(teacher)
                .sessionType(ScheduleSessionType.LECTURE)
                .dayOfWeek(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 30))
                .capacity(30)
                .status("ACTIVE")
                .build());
    }

    private AttendanceRecord attend(ScheduleSession session, User markedBy) {
        return attendanceRecordRepository.save(AttendanceRecord.builder()
                .scheduleSession(session)
                .sessionDate(LocalDate.now())
                .student(student)
                .status(AttendanceStatus.PRESENT)
                .markedBy(markedBy)
                .markedAt(LocalDateTime.now())
                .build());
    }

    @Test
    @WithMockUser(username = ADMIN, roles = "ADMIN")
    void teacherWithAssignedSubjectCannotBeDeleted() throws Exception {
        mockMvc.perform(delete("/api/users/" + teacherA.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("caktuara")));

        assertThat(userRepository.findById(teacherA.getId())).isPresent();
    }

    @Test
    @WithMockUser(username = ADMIN, roles = "ADMIN")
    void teacherBecomesDeletableOnceSubjectsAreReassigned() throws Exception {
        subject.setTeacher(teacherB);
        subjectRepository.save(subject);

        mockMvc.perform(delete("/api/users/" + teacherA.getId()))
                .andExpect(status().isNoContent());

        assertThat(userRepository.findById(teacherA.getId())).isEmpty();
    }

    @Test
    @WithMockUser(username = ADMIN, roles = "ADMIN")
    void deletingSessionOwnerClearsAttendanceRecordsThenSessions() throws Exception {
        // teacherB owns the schedule session (allowed: ScheduleSession.teacher may
        // differ from Subject.teacher). teacherB is NOT the subject's teacher, so the
        // subject guard doesn't apply — but attendance_records FK schedule_sessions,
        // so they must be cleared before the sessions.
        ScheduleSession session = newSession(teacherB);
        Long sessionId = session.getId();
        Long recordId = attend(session, teacherB).getId();

        mockMvc.perform(delete("/api/users/" + teacherB.getId()))
                .andExpect(status().isNoContent());

        assertThat(userRepository.findById(teacherB.getId())).isEmpty();
        assertThat(scheduleSessionRepository.findById(sessionId)).isEmpty();
        assertThat(attendanceRecordRepository.findById(recordId)).isEmpty();
    }

    @Test
    @WithMockUser(username = ADMIN, roles = "ADMIN")
    void deletingTheStudentClearsAttendanceRecordsTheyAppearIn() throws Exception {
        ScheduleSession session = newSession(teacherB);
        Long recordId = attend(session, teacherB).getId();

        mockMvc.perform(delete("/api/users/" + student.getId()))
                .andExpect(status().isNoContent());

        assertThat(userRepository.findById(student.getId())).isEmpty();
        assertThat(attendanceRecordRepository.findById(recordId)).isEmpty();
        // the session (owned by teacherB, untouched) survives
        assertThat(scheduleSessionRepository.findById(session.getId())).isPresent();
    }

    @Test
    @WithMockUser(username = ADMIN, roles = "ADMIN")
    void deletingADepartmentHeadLeavesTheDepartmentWithNoHead() throws Exception {
        dept.setHead(teacherB);
        departmentRepository.save(dept);

        mockMvc.perform(delete("/api/users/" + teacherB.getId()))
                .andExpect(status().isNoContent());

        Department reloaded = departmentRepository.findById(dept.getId()).orElseThrow();
        assertThat(reloaded.getHead()).isNull();
    }
}

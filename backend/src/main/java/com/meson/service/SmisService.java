package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.*;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SmisService {

    // TODO: hardcoded course catalog — belongs in the database, not in code
     static final List<SmisCatalogCourse> COMPUTER_SCIENCE_COURSES = List.of(
            new SmisCatalogCourse("40ICP101", "Hyrje në Shkenca Kompjuterike dhe Programim", "Obligative"),
            new SmisCatalogCourse("40MAT102", "Matematikë 1", "Obligative"),
            new SmisCatalogCourse("40FEE103", "Bazat e Inxhinierise Elektronike / Elektrike", "Obligative"),
            new SmisCatalogCourse("40CAO104", "Arkitektura dhe Organizimi i Kompjuterëve", "Obligative"),
            new SmisCatalogCourse("40AWS105", "Shkrim Akademik dhe Seminar", "Obligative"),
            new SmisCatalogCourse("40ENG106", "Gjuhë Angleze për Inxhinieri", "Obligative"),
            new SmisCatalogCourse("40ITA107", "Gjuhe Italiane", "Zgjedhore"),
            new SmisCatalogCourse("40MAT151", "Matematikë 2", "Obligative"),
            new SmisCatalogCourse("40OSY152", "Sistemet Operative", "Obligative"),
            new SmisCatalogCourse("40CS1150", "Shkenca Kompjuterike 1", "Obligative"),
            new SmisCatalogCourse("40IIS154", "Hyrje në Sigurinë e Informacionit", "Obligative"),
            new SmisCatalogCourse("40HCI155", "Ndërveprimi Kompjuter-Njeri", "Obligative"),
            new SmisCatalogCourse("40CNC202", "Rrjeta Kompjuterike dhe Komunikimi", "Obligative"),
            new SmisCatalogCourse("40ITA203", "Hyrje ne Algoritme", "Obligative"),
            new SmisCatalogCourse("40ADS251", "Algoritmet dhe Strukturat e të dhënave", "Obligative"),
            new SmisCatalogCourse("40SS253", "Sisteme dhe Sinjale", "Obligative"),
            new SmisCatalogCourse("40GP304", "Programimi i Lojerave", "Zgjedhore"),
            new SmisCatalogCourse("40DEV305", "DevOps", "Zgjedhore"),
            new SmisCatalogCourse("40SQL307", "Bazat e te dhenave NoSQL", "Zgjedhore"),
            new SmisCatalogCourse("40SA310", "Sensoret dhe Aktivizuesit", "Zgjedhore"),
            new SmisCatalogCourse("40PP303", "Programimi ne Python", "Zgjedhore"),
            new SmisCatalogCourse("40MPE302", "Menaxhimi i Projekteve dhe Ndermarresia", "Obligative"),
            new SmisCatalogCourse("40DSP311", "Perpunimi Dixhital i Sinjalit", "Zgjedhore"),
            new SmisCatalogCourse("40ES301", "Sistemet e Nderlidhura", "Obligative"),
            new SmisCatalogCourse("40IOT309", "Interneti i Gjerave (IoT)", "Zgjedhore"),
            new SmisCatalogCourse("40LC1300", "Bazat e Inteligjences Artificiale", "Obligative"),
            new SmisCatalogCourse("40STJ306", "Teknologjite e perzgjedhura (JavaScript Frameworks, R eti)", "Zgjedhore"),
            new SmisCatalogCourse("40SI308", "Infrastruktura e Servereve", "Zgjedhore"),
            new SmisCatalogCourse("40BMA312", "Blockchain ne Aplikacionet Multidisiplinare", "Zgjedhore"),
            new SmisCatalogCourse("40CE358", "Etika Kompjuterike", "Zgjedhore"),
            new SmisCatalogCourse("40FB356", "Financimi dhe Buxhetimi", "Zgjedhore"),
            new SmisCatalogCourse("40BTH352", "Punimi i Temes se Bachelor-it", "Obligative"),
            new SmisCatalogCourse("40PEP354", "Psikologjia ne Projektet Inxhinierike", "Zgjedhore"),
            new SmisCatalogCourse("40IEE357", "Hyrje ne Ekonomine Inxhinierike", "Zgjedhore"),
            new SmisCatalogCourse("40LC2351", "Lenda Laboratorike 2 (Projekt Grupor)", "Obligative"),
            new SmisCatalogCourse("40EAM355", "Metodat e Analizes Ekonomike", "Zgjedhore"),
            new SmisCatalogCourse("40CC350", "Cloud Computing", "Obligative"),
            new SmisCatalogCourse("40OCC353", "Orientimi ne Karriere - Komunikim dhe Zhvillim", "Zgjedhore")
    );

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final ExamApplicationRepository examApplicationRepository;
    private final GradeRepository gradeRepository;

    @Transactional(readOnly = true)
    public List<SmisCourseResponse> getAvailableCourses() {
        List<SmisProfessorOptionResponse> professors = userRepository.findAllByRoleNormalizedName("TEACHER")
                .stream()
                .map(this::toProfessorOption)
                .toList();
        Set<Long> alreadyAppliedSubjectIds = activeApplicationSubjectIdsForCurrentStudent();

        return subjectRepository.findByStatusi(SubjectStatus.PUBLIKUAR)
                .stream()
                .filter(this::isComputerScienceCourse)
                .filter(subject -> !alreadyAppliedSubjectIds.contains(subject.getId()))
                .sorted(Comparator.comparing(Subject::getSemester).thenComparing(this::courseCode))
                .map(subject -> toCourseResponse(subject, professorsForCourse(subject, professors)))
                .toList();
    }

    @Transactional
    public ExamApplicationResponse registerExam(Long studentId, ExamApplicationRequest request) {
        if (!getCurrentUser().getId().equals(studentId) && !hasRole("ADMIN")) {
            throw new AccessDeniedException("Nuk keni qasje per kete student");
        }

        if (examApplicationRepository.existsByStudentIdAndSubjectIdAndStatusIn(
                studentId,
                request.getCourseId(),
                List.of(ExamApplicationStatus.REGISTERED, ExamApplicationStatus.GRADED))) {
            throw new BadRequestException("Provimi eshte paraqitur tashme per kete lende");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Studenti nuk u gjet"));
        Subject subject = subjectRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Kursi nuk u gjet"));
        User professor = userRepository.findById(request.getProfessorId())
                .orElseThrow(() -> new ResourceNotFoundException("Profesori nuk u gjet"));

        ExamApplication application = ExamApplication.builder()
                .student(student)
                .subject(subject)
                .professor(professor)
                .status(ExamApplicationStatus.REGISTERED)
                .appliedAt(LocalDateTime.now())
                .build();

        return toResponse(examApplicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public List<ExamApplicationResponse> getStudentApplications(Long studentId) {
        if (!getCurrentUser().getId().equals(studentId) && !hasRole("ADMIN") && !hasRole("TEACHER")) {
            throw new AccessDeniedException("Nuk keni qasje per kete student");
        }
        return examApplicationRepository.findByStudentIdOrderByAppliedAtDesc(studentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ExamApplicationResponse cancelApplication(Long studentId, Long applicationId) {
        ExamApplication application = examApplicationRepository.findByIdAndStudentId(applicationId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Paraqitja e provimit nuk u gjet"));
        if (application.getGrade() != null || application.getStatus() == ExamApplicationStatus.GRADED) {
            throw new BadRequestException("Paraqitja nuk mund te anulohet pasi eshte vendosur nota");
        }
        application.setStatus(ExamApplicationStatus.CANCELLED);
        application.setCancelledAt(LocalDateTime.now());
        return toResponse(examApplicationRepository.save(application));
    }

    @Transactional
    public ExamApplicationResponse refuseGrade(Long studentId, Long applicationId) {
        ExamApplication application = examApplicationRepository.findByIdAndStudentId(applicationId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Paraqitja e provimit nuk u gjet"));
        if (application.getGrade() == null || application.getStatus() != ExamApplicationStatus.GRADED) {
            throw new BadRequestException("Nota mund te refuzohet vetem pasi te vendoset nga profesori");
        }
        application.setStatus(ExamApplicationStatus.REFUSED);
        application.setRejectedAt(LocalDateTime.now());
        return toResponse(examApplicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public List<ExamApplicationResponse> getProfessorApplications() {
        User professor = getCurrentUser();
        return examApplicationRepository.findByProfessorIdOrderByAppliedAtDesc(professor.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ExamApplicationResponse submitGrade(Long applicationId, ExamGradeRequest request) {
        User professor = getCurrentUser();
        ExamApplication application = hasRole("ADMIN")
                ? examApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Paraqitja e provimit nuk u gjet"))
                : examApplicationRepository.findByIdAndProfessorId(applicationId, professor.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni qasje ne kete paraqitje"));

        if (application.getStatus() == ExamApplicationStatus.CANCELLED) {
            throw new BadRequestException("Nuk mund te vendoset nota per provim te anuluar");
        }

        Grade grade = application.getGrade();
        if (grade == null) {
            grade = gradeRepository.findByStudentIdAndSubjectId(
                    application.getStudent().getId(),
                    application.getSubject().getId()).orElse(null);
        }
        if (grade == null) {
            grade = Grade.builder()
                    .student(application.getStudent())
                    .subject(application.getSubject())
                    .professor(application.getProfessor())
                    .grade(request.getGrade())
                    .comment(request.getComment())
                    .assignedAt(LocalDateTime.now())
                    .build();
        } else {
            grade.setGrade(request.getGrade());
            grade.setComment(request.getComment());
            grade.setAssignedAt(LocalDateTime.now());
        }

        Grade savedGrade = gradeRepository.save(grade);
        application.setGrade(savedGrade);
        application.setStatus(ExamApplicationStatus.GRADED);
        application.setGradeAssignedAt(savedGrade.getAssignedAt());
        application.setRejectedAt(null);

        return toResponse(examApplicationRepository.save(application));
    }

    @Transactional
    public ExamApplicationResponse deleteGrade(Long applicationId) {
        User professor = getCurrentUser();
        ExamApplication application = hasRole("ADMIN")
                ? examApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Paraqitja e provimit nuk u gjet"))
                : examApplicationRepository.findByIdAndProfessorId(applicationId, professor.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni qasje ne kete paraqitje"));

        Grade grade = application.getGrade();
        if (grade == null) {
            grade = gradeRepository.findByStudentIdAndSubjectId(
                    application.getStudent().getId(),
                    application.getSubject().getId()).orElse(null);
        }

        if (grade == null) {
            throw new BadRequestException("Kjo paraqitje nuk ka note per fshirje");
        }

        application.setGrade(null);
        application.setStatus(ExamApplicationStatus.REGISTERED);
        application.setGradeAssignedAt(null);
        application.setRejectedAt(null);
        ExamApplication saved = examApplicationRepository.saveAndFlush(application);
        gradeRepository.delete(grade);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ExamApplicationResponse> getAdminApplications(String status) {
        if (status == null || status.isBlank()) {
            return examApplicationRepository.findAllByOrderByAppliedAtDesc().stream().map(this::toResponse).toList();
        }
        ExamApplicationStatus resolved = ExamApplicationStatus.valueOf(status.trim().toUpperCase());
        return examApplicationRepository.findByStatusOrderByAppliedAtDesc(resolved).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SmisAdminSummaryResponse getAdminSummary() {
        Map<ExamApplicationStatus, Long> counts = examApplicationRepository.findAll()
                .stream()
                .collect(java.util.stream.Collectors.groupingBy(ExamApplication::getStatus, java.util.stream.Collectors.counting()));
        return SmisAdminSummaryResponse.builder()
                .registered(counts.getOrDefault(ExamApplicationStatus.REGISTERED, 0L))
                .graded(counts.getOrDefault(ExamApplicationStatus.GRADED, 0L))
                .refused(counts.getOrDefault(ExamApplicationStatus.REFUSED, 0L))
                .cancelled(counts.getOrDefault(ExamApplicationStatus.CANCELLED, 0L))
                .total(counts.values().stream().mapToLong(Long::longValue).sum())
                .build();
    }

    private SmisCourseResponse toCourseResponse(Subject subject, List<SmisProfessorOptionResponse> professors) {
        return SmisCourseResponse.builder()
                .id(subject.getId())
                .code(courseCode(subject))
                .name(subject.getTitulli())
                .ects(subject.getEcts())
                .semester(subject.getSemester())
                .category(courseCategory(subject))
                .professors(professors)
                .build();
    }

    private SmisProfessorOptionResponse toProfessorOption(User professor) {
        return SmisProfessorOptionResponse.builder()
                .id(professor.getId())
                .name(professor.getEmri() + " " + professor.getMbiemri())
                .email(professor.getEmail())
                .build();
    }

    private List<SmisProfessorOptionResponse> professorsForCourse(
            Subject subject,
            List<SmisProfessorOptionResponse> allProfessors) {
        List<String> allowedEmails = professorEmailsForCourse(subject);
        if (allowedEmails.isEmpty()) {
            return allProfessors;
        }
        return allProfessors.stream()
                .filter(professor -> allowedEmails.contains(professor.getEmail().toLowerCase()))
                .toList();
    }


    // TODO: hardcoded professor-email-to-course-title mapping — belongs in the database, not in code
    private List<String> professorEmailsForCourse(Subject subject) {
        String title = subject != null && subject.getTitulli() != null ? subject.getTitulli().trim().toLowerCase() : "";
        if (title.equals("hyrje ne algoritme")
                || title.equals("algoritmet dhe strukturat e të dhënave")
                || title.equals("algoritmet dhe strukturat e te dhenave")) {
            return List.of("shkelqim.berisha@meson.com");
        }
        return List.of();
    }

    private ExamApplicationResponse toResponse(ExamApplication application) {
        Grade grade = application.getGrade();
        Subject subject = application.getSubject();
        return ExamApplicationResponse.builder()
                .id(application.getId())
                .studentId(application.getStudent().getId())
                .studentName(application.getStudent().getEmri() + " " + application.getStudent().getMbiemri())
                .studentEmail(application.getStudent().getEmail())
                .courseId(subject.getId())
                .courseCode(courseCode(subject))
                .courseName(subject.getTitulli())
                .courseEcts(subject.getEcts())
                .semester(subject.getSemester())
                .category(courseCategory(subject))
                .professorId(application.getProfessor().getId())
                .professorName(application.getProfessor().getEmri() + " " + application.getProfessor().getMbiemri())
                .status(application.getStatus())
                .appliedAt(application.getAppliedAt())
                .grade(grade != null ? grade.getGrade() : null)
                .gradeStatus(application.getStatus().name())
                .comment(grade != null ? grade.getComment() : null)
                .gradeAssignedAt(application.getGradeAssignedAt())
                .rejectedAt(application.getRejectedAt())
                .cancelledAt(application.getCancelledAt())
                .build();
    }

    private String courseCode(Subject subject) {
        SmisCatalogCourse catalogCourse = catalogCourse(subject);
        if (catalogCourse != null) {
            return catalogCourse.code();
        }
        return "MESON" + String.format("%03d", subject.getId());
    }

    private String courseCategory(Subject subject) {
        SmisCatalogCourse catalogCourse = catalogCourse(subject);
        if (catalogCourse != null) {
            return catalogCourse.category();
        }
        return subject.getDepartment() != null ? subject.getDepartment().getEmertimi() : "Pa kategori";
    }

    private SmisCatalogCourse catalogCourse(Subject subject) {
        if (subject == null || subject.getTitulli() == null) {
            return null;
        }
        String title = subject.getTitulli().trim();
        return COMPUTER_SCIENCE_COURSES.stream()
                .filter(catalogCourse -> catalogCourse.title().equalsIgnoreCase(title))
                .findFirst()
                .orElse(null);
    }

    private boolean isComputerScienceCourse(Subject subject) {
        if (catalogCourse(subject) != null) {
            return true;
        }
        return subject.getDepartment() != null
                && "Shkenca kompjuterike dhe inxhinieri".equalsIgnoreCase(subject.getDepartment().getEmertimi());
    }

    private Set<Long> activeApplicationSubjectIdsForCurrentStudent() {
        if (!hasRole("STUDENT")) {
            return Set.of();
        }
        Long studentId = getCurrentUser().getId();
        return examApplicationRepository.findByStudentIdOrderByAppliedAtDesc(studentId)
                .stream()
                .filter(application -> application.getStatus() == ExamApplicationStatus.REGISTERED
                        || application.getStatus() == ExamApplicationStatus.GRADED)
                .map(application -> application.getSubject().getId())
                .collect(Collectors.toSet());
    }

    private record SmisCatalogCourse(String code, String title, String category) {}

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Perdoruesi nuk u gjet"));
    }

    private boolean hasRole(String role) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        String target = "ROLE_" + role;
        return auth.getAuthorities().stream().anyMatch(a -> target.equals(a.getAuthority()));
    }
}
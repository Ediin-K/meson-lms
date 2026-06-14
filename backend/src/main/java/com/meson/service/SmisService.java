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

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SmisService {

    private static final List<SmisCatalogCourse> COMPUTER_SCIENCE_COURSES = List.of(
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
            new SmisCatalogCourse("40FBD250", "Bazat e Teknologjive Big Data", "Obligative"),
            new SmisCatalogCourse("40WDD205", "Dizajni dhe Zhvillimi i Uebit", "Obligative"),
            new SmisCatalogCourse("40SW254", "Inxhinieria Softuerike", "Obligative"),
            new SmisCatalogCourse("40DCS153", "Qarqet Digjitale dhe Sinjalet", "Obligative"),
            new SmisCatalogCourse("40CS2200", "Shkenca Kompjuterike 2", "Obligative"),
            new SmisCatalogCourse("40DS201", "Sistemet e Bazës së të Dhënave", "Obligative"),
            new SmisCatalogCourse("40DS1204", "Struktura Diskrete 1 (Matematikë)", "Obligative"),
            new SmisCatalogCourse("40SD2252", "Struktura Diskrete 2 (Probabilitet dhe Modelim)", "Obligative"),
            new SmisCatalogCourse("40LCP255", "Lënda Laboratorike 1 (Projekt Grupor)", "Obligative"),
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
        Set<Long> alreadyAppliedCourseIds = activeApplicationCourseIdsForCurrentStudent();

        return subjectRepository.findByStatusi(SubjectStatus.PUBLIKUAR)
                .stream()
                .filter(this::isComputerScienceCourse)
                .filter(course -> !alreadyAppliedCourseIds.contains(course.getId()))
                .sorted(Comparator.comparing(Subject::getSemester).thenComparing(course -> courseCode(course)))
                .map(course -> toCourseResponse(course, professorsForCourse(course, professors)))
                .toList();
    }

    @Transactional
    public ExamApplicationResponse registerExam(Long studentId, ExamApplicationRequest request) {
        if (!getCurrentUser().getId().equals(studentId) && !hasRole("ADMIN")) {
            throw new AccessDeniedException("Nuk keni qasje per kete student");
        }

        if (examApplicationRepository.existsByStudentIdAndCourseIdAndStatusIn(
                studentId,
                request.getCourseId(),
                List.of(ExamApplicationStatus.REGISTERED, ExamApplicationStatus.GRADED))) {
            throw new BadRequestException("Provimi eshte paraqitur tashme per kete lende");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Studenti nuk u gjet"));
        Subject course = subjectRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Kursi nuk u gjet"));
        User professor = userRepository.findById(request.getProfessorId())
                .orElseThrow(() -> new ResourceNotFoundException("Profesori nuk u gjet"));

        ExamApplication application = ExamApplication.builder()
                .student(student)
                .course(course)
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
        return examApplicationRepository.findByStudentIdAndStatusInOrderByAppliedAtDesc(
                        studentId,
                        List.of(
                                ExamApplicationStatus.REGISTERED,
                                ExamApplicationStatus.GRADED,
                                ExamApplicationStatus.REFUSED
                        ))
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
                    application.getCourse().getId()).orElse(null);
        }
        if (grade == null) {
            grade = Grade.builder()
                    .student(application.getStudent())
                    .subject(application.getCourse())
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
                    application.getCourse().getId()).orElse(null);
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

    private SmisCourseResponse toCourseResponse(Subject course, List<SmisProfessorOptionResponse> professors) {
        return SmisCourseResponse.builder()
                .id(course.getId())
                .code(courseCode(course))
                .name(course.getTitulli())
                .ects(course.getEcts())
                .semester(course.getSemester())
                .category(courseCategory(course))
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
            Subject course,
            List<SmisProfessorOptionResponse> allProfessors) {
        List<String> allowedEmails = professorEmailsForCourse(course);
        if (allowedEmails.isEmpty()) {
            return List.of();
        }
        return allProfessors.stream()
                .filter(professor -> allowedEmails.contains(professor.getEmail().toLowerCase()))
                .toList();
    }

    private List<String> professorEmailsForCourse(Subject course) {
        return switch (normalizedCourseTitle(course)) {
            case "algoritmet dhe strukturat e te dhenave" -> List.of("shkelqim.berisha@meson.com");
            case "bazat e teknologjive big data" -> List.of("bertan.karahoda@meson.com");
            case "dizajni dhe zhvillimi i uebit" -> List.of(
                    "greta.ahma@meson.com",
                    "erzen.talla@meson.com",
                    "elton.boshnjaku@meson.com"
            );
            case "nderveprimi kompjuter-njeri",
                    "nderveprimi kompjuter njeri" -> List.of("greta.ahma@meson.com");
            case "hyrje ne algoritme" -> List.of("shkelqim.berisha@meson.com");
            case "inxhinieria softuerike" -> List.of(
                    "erzen.talla@meson.com",
                    "ramadan.dervishi@meson.com"
            );
            case "sistemet e bazes se te dhenave" -> List.of(
                    "erzen.talla@meson.com",
                    "zijadin.krasniqi@meson.com",
                    "elton.boshnjaku@meson.com"
            );
            case "arkitektura dhe organizimi i kompjutereve" -> List.of(
                    "ramadan.dervishi@meson.com",
                    "valdrin.haxhiu@meson.com"
            );
            case "shkenca kompjuterike 1" -> List.of(
                    "lavdim.menxhiqi@meson.com",
                    "blerim.zylfiu@meson.com"
            );
            case "shkenca kompjuterike 2" -> List.of(
                    "lavdim.menxhiqi@meson.com",
                    "blerim.zylfiu@meson.com",
                    "lamir.shkurti@meson.com"
            );
            case "lenda laboratorike 1 projekt grupor" -> List.of(
                    "lavdim.menxhiqi@meson.com",
                    "besnik.qehaja@meson.com",
                    "blerim.zylfiu@meson.com"
            );
            case "qarqe digjitale dhe sinjalet", "qarqet digjitale dhe sinjalet" -> List.of(
                    "besnik.qehaja@meson.com",
                    "kjani.guri@meson.com",
                    "zhilbert.tafa@meson.com"
            );
            case "bazat e inxhinierise elektronike elektrike",
                    "bazat e inxhinierise elektrike dhe elektronike" -> List.of(
                    "kjani.guri@meson.com",
                    "vehbi.sofiu@meson.com"
            );
            case "struktura diskrete 1 matematike", "struktura diskrete 1" -> List.of(
                    "diellza.berisha@meson.com",
                    "nazmi.misini@meson.com"
            );
            case "struktura diskrete 2 probabilitet dhe modelim", "struktura diskrete 2" -> List.of(
                    "diellza.berisha@meson.com",
                    "nazmi.misini@meson.com"
            );
            case "matematike 1" -> List.of(
                    "nazmi.misini@meson.com",
                    "hizer.leka@meson.com"
            );
            case "matematike 2" -> List.of("hizer.leka@meson.com");
            case "sisteme dhe sinjale" -> List.of(
                    "armend.ymeri@meson.com",
                    "vehbi.sofiu@meson.com"
            );
            case "sistemet e nderlidhura" -> List.of("astrit.hulaj@meson.com");
            case "bazat e inteligjences artificiale" -> List.of(
                    "komision.transfer@meson.com",
                    "zhilbert.tafa@meson.com"
            );
            case "teknologjite e perzgjedhura javascript frameworks r eti" -> List.of(
                    "bertan.karahoda@meson.com",
                    "lavdim.beqiri@meson.com"
            );
            case "blockchain ne aplikacionet multidisiplinare" -> List.of(
                    "komision.transfer@meson.com",
                    "osman.osmani@meson.com",
                    "lavdim.beqiri@meson.com"
            );
            case "psikologjia ne projektet inxhinierike" -> List.of(
                    "besnik.qehaja@meson.com",
                    "vehbi.sofiu@meson.com",
                    "alma.novoberdaliu@meson.com",
                    "liridon.hoti@meson.com",
                    "hizer.leka@meson.com",
                    "zijadin.krasniqi@meson.com",
                    "lavdim.beqiri@meson.com",
                    "lamir.shkurti@meson.com"
            );
            case "metodat e analizes ekonomike" -> List.of(
                    "elton.boshnjaku@meson.com",
                    "liridon.hoti@meson.com",
                    "besnik.qehaja@meson.com",
                    "ramadan.dervishi@meson.com"
            );
            case "orientimi ne karriere komunikim dhe zhvillim" -> List.of(
                    "osman.osmani@meson.com",
                    "lavdim.beqiri@meson.com",
                    "elissa.mollakuqe@meson.com",
                    "shejnaze.gagica@meson.com",
                    "anita.sadikaj@meson.com",
                    "anton.gojani@meson.com",
                    "zejnije.bytyqi@meson.com"
            );
            case "rrjeta kompjuterike", "rrjeta kompjuterike dhe komunikimi" -> List.of(
                    "zhilbert.tafa@meson.com",
                    "lavdim.beqiri@meson.com"
            );
            case "hyrje ne shkenca dhe programim",
                    "hyrje ne shkenca kompjuterike dhe programim" -> List.of(
                    "naim.llumnica@meson.com",
                    "blerim.zylfiu@meson.com",
                    "elita.hajrizi@meson.com"
            );
            case "gjuhe angleze per inxhinieri" -> List.of(
                    "lisjeta.thaqi@meson.com",
                    "adea.haxhiavdyli@meson.com"
            );
            case "gjuhe italiane" -> List.of("raffaela.vespuci@meson.com");
            case "shkrim akademik dhe seminar" -> List.of("shejnaze.gagica@meson.com");
            case "sistemet operative" -> List.of(
                    "valdrin.haxhiu@meson.com",
                    "lavdim.beqiri@meson.com"
            );
            case "hyrje ne sigurine e informacionit" -> List.of(
                    "lavdim.beqiri@meson.com",
                    "blerton.abazi@meson.com"
            );
            default -> List.of();
        };
    }

    private String normalizedCourseTitle(Subject course) {
        if (course == null || course.getTitulli() == null) {
            return "";
        }
        String normalized = Normalizer.normalize(course.getTitulli(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replace("/", " ")
                .replace("(", " ")
                .replace(")", " ")
                .replace("-", " ")
                .replaceAll("\\s+", " ")
                .trim();
        return normalized;
    }

    private ExamApplicationResponse toResponse(ExamApplication application) {
        Grade grade = application.getGrade();
        Subject course = application.getCourse();
        return ExamApplicationResponse.builder()
                .id(application.getId())
                .studentId(application.getStudent().getId())
                .studentName(application.getStudent().getEmri() + " " + application.getStudent().getMbiemri())
                .studentEmail(application.getStudent().getEmail())
                .courseId(course.getId())
                .courseCode(courseCode(course))
                .courseName(course.getTitulli())
                .courseEcts(course.getEcts())
                .semester(course.getSemester())
                .category(courseCategory(course))
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

    private String courseCode(Subject course) {
        SmisCatalogCourse catalogCourse = catalogCourse(course);
        if (catalogCourse != null) {
            return catalogCourse.code();
        }
        return "MESON" + String.format("%03d", course.getId());
    }

    private String courseCategory(Subject course) {
        SmisCatalogCourse catalogCourse = catalogCourse(course);
        if (catalogCourse != null) {
            return catalogCourse.category();
        }
        return course.getDepartment() != null ? course.getDepartment().getEmertimi() : "Pa kategori";
    }

    private SmisCatalogCourse catalogCourse(Subject course) {
        if (course == null || course.getTitulli() == null) {
            return null;
        }
        String title = course.getTitulli().trim();
        return COMPUTER_SCIENCE_COURSES.stream()
                .filter(catalogCourse -> catalogCourse.title().equalsIgnoreCase(title))
                .findFirst()
                .orElse(null);
    }

    private boolean isComputerScienceCourse(Subject course) {
        if (catalogCourse(course) != null) {
            return true;
        }
        return course.getDepartment() != null
                && "Shkenca kompjuterike dhe inxhinieri".equalsIgnoreCase(course.getDepartment().getEmertimi());
    }

    private Set<Long> activeApplicationCourseIdsForCurrentStudent() {
        if (!hasRole("STUDENT")) {
            return Set.of();
        }
        Long studentId = getCurrentUser().getId();
        return examApplicationRepository.findByStudentIdOrderByAppliedAtDesc(studentId)
                .stream()
                .filter(application -> application.getStatus() == ExamApplicationStatus.REGISTERED
                        || application.getStatus() == ExamApplicationStatus.GRADED)
                .map(application -> application.getCourse().getId())
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

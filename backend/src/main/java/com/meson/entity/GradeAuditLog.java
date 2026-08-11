package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * One row per grade change. Deliberately not linked to Grade via a JPA relationship -
 * grade rows are hard-deleted, and this table exists specifically to survive that.
 */
@Entity
@Table(name = "grade_audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "grade_id", nullable = false)
    private Long gradeId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "subject_titulli", nullable = false)
    private String subjectTitulli;

    @Column(name = "performed_by_id", nullable = false)
    private Long performedById;

    @Column(name = "performed_by_name", nullable = false)
    private String performedByName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GradeAuditAction action;

    @Column(name = "previous_grade")
    private Integer previousGrade;

    @Column(name = "new_grade")
    private Integer newGrade;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;
}

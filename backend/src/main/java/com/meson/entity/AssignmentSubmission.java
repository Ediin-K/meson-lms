package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(
    name = "assignment_submissions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"assignment_id", "student_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false)
    private String fileName;

    /** Timestamp of the latest (current) file, UTC. */
    @Column(nullable = false)
    private Instant submittedAt;

    /** Timestamp of the very first submission — audit trail survives resubmissions. */
    @Column(name = "first_submitted_at", nullable = false)
    private Instant firstSubmittedAt;

    @Builder.Default
    @Column(name = "is_late", nullable = false)
    private boolean late = false;

    private Double grade;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "graded_at")
    private Instant gradedAt;

    @PrePersist
    void onCreate() {
        if (submittedAt == null) submittedAt = Instant.now();
        if (firstSubmittedAt == null) firstSubmittedAt = submittedAt;
    }
}

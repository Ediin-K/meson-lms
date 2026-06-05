package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"user", "subject", "subjectGroup", "subjectSubgroup"})
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_group_id")
    private SubjectGroup subjectGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_subgroup_id")
    private SubjectSubgroup subjectSubgroup;

    @Builder.Default
    @Column(name = "progress")
    private Double progresi = 0.0;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EnrollmentStatus statusi = EnrollmentStatus.AKTIV;

    @Column(name = "enrollment_date", nullable = false, updatable = false)
    private LocalDateTime dataRegjistrimit;

    @PrePersist
    protected void onCreate() {
        this.dataRegjistrimit = LocalDateTime.now();
    }
}

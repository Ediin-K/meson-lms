package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "academic_terms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicTerm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = false;

    @Column(name = "enrollment_start", nullable = false)
    private LocalDateTime enrollmentStart;

    @Column(name = "enrollment_end", nullable = false)
    private LocalDateTime enrollmentEnd;

    @Column(name = "exam_application_start", nullable = false)
    private LocalDateTime examApplicationStart;

    @Column(name = "exam_application_end", nullable = false)
    private LocalDateTime examApplicationEnd;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

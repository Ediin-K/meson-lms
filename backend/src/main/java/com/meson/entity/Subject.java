package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"teacher", "direction", "enrollments", "groups"})
public class Subject {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, unique = true)
    private String titulli;

    @Column(name = "description", nullable = false)
    private String pershkrimi;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Direction direction;

    @Column(nullable=false)
    private Integer semester;

    @Column
    private String enrollmentKey;

    @Builder.Default
    @Column(name = "price")
    private double cmimi = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private Integer ects = 5;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "level")
    private SubjectLevel niveli = SubjectLevel.FILLESTAR;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SubjectStatus statusi = SubjectStatus.DRAFT;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ToString.Exclude
    private java.util.Set<Enrollment> enrollments;

    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ToString.Exclude
    private java.util.Set<SubjectGroup> groups;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

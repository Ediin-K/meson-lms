package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subject_group_teachers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"subjectGroup", "teacher"})
public class SubjectGroupTeacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_group_id", nullable = false)
    private SubjectGroup subjectGroup;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Column(nullable = false)
    private String role;
}

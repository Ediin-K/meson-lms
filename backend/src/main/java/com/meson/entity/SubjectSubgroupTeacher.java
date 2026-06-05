package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subject_subgroup_teachers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"subjectSubgroup", "teacher"})
public class SubjectSubgroupTeacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_subgroup_id", nullable = false)
    private SubjectSubgroup subjectSubgroup;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Column(nullable = false)
    private String role;
}

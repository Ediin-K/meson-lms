package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * One teacher of a subject. A subject's teacher pool is the full set of these
 * rows, ordered by {@code sortOrder}; the first one mirrors {@code Subject.teacher}
 * (the denormalised "primary"). Content management is open to any pool member;
 * grading is further scoped to the teacher's own groups.
 */
@Entity
@Table(name = "subject_teachers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"subject", "teacher"})
public class SubjectTeacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}

package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "student_group_selections",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_student_group_selection_student",
                columnNames = "student_id"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"student", "departmentGroup"})
public class StudentGroupSelection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_group_id", nullable = false)
    private DepartmentGroup departmentGroup;

    @Column(name = "selected_at", nullable = false)
    private LocalDateTime selectedAt;
}

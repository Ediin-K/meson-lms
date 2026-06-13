package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"user", "department", "approvedDepartmentGroup"})
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(nullable = false)
    private Integer currentSemester;

    @Column(name = "parent_name")
    private String parentName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;

    private String birthplace;

    @Column(name = "academic_year")
    private String academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_department_group_id")
    private DepartmentGroup approvedDepartmentGroup;
}

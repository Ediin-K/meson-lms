package com.meson.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "subject_subgroups")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"subjectGroup", "teachers", "enrollments"})
public class SubjectSubgroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_group_id", nullable = false)
    private SubjectGroup subjectGroup;

    @Column(nullable = false)
    private String name;

    private Integer capacity;

    private String schedule;

    @OneToMany(mappedBy = "subjectSubgroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    private Set<SubjectSubgroupTeacher> teachers;

    @OneToMany(mappedBy = "subjectSubgroup")
    @JsonIgnore
    @ToString.Exclude
    private Set<Enrollment> enrollments;
}

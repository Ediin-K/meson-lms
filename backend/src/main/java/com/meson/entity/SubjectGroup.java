package com.meson.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "subject_groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"subject", "directionGroup", "teachers", "subgroups", "enrollments"})
public class SubjectGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    private String name;

    private Integer capacity;

    private String schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "direction_group_id")
    private DirectionGroup directionGroup;

    @OneToMany(mappedBy = "subjectGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    private Set<SubjectGroupTeacher> teachers;

    @OneToMany(mappedBy = "subjectGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    private Set<SubjectSubgroup> subgroups;

    @OneToMany(mappedBy = "subjectGroup")
    @JsonIgnore
    @ToString.Exclude
    private Set<Enrollment> enrollments;
}

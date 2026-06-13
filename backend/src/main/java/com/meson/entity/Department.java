package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name="departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"subjects"})
public class Department {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String emertimi;

    @Column(name = "description", columnDefinition = "TEXT")
    private String pershkrimi;

    @Column(name = "num_semesters", nullable = false)
    private Integer numSemesters;

    @Builder.Default
    @OneToMany(mappedBy="department", fetch = FetchType.LAZY)
    private List<Subject> subjects = new ArrayList<>();

}

package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name="directions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"subjects"})
public class Direction {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String emertimi;

    @Column(name = "description", columnDefinition = "TEXT")
    private String pershkrimi;

    @Builder.Default
    @OneToMany(mappedBy="direction", fetch = FetchType.LAZY)
    private List<Subject> subjects = new ArrayList<>();

}

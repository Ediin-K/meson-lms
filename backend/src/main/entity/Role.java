package com.meson.mesonlmsbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;


@Entity
@Table(name="roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Role{
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, uniqeue = true)
    private String emertimi;

    private String pershkrimi ;

    @Column(nullable = false, unique = true)
    private String normalized_name

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
    private Set<UserRole> userRoles;

}

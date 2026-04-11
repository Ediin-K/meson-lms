package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name="users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String emri;

    @Column(nullable=false)
    private String mbiemri;

    @Column(nullable=false, unique=true)
    private String email;

    @Column(nullable=false)
    private String passwordHash;

    private String phoneNumber;

    @Column(nullable = false)
    private boolean emailConfirmed = false;

    @Column(nullable = false)
    private boolean lockoutEnable = false;

    @Column(nullable = false)
    private int accessFailedCount = 0;

    @Column(nullable=false)
    private LocalDateTime dataKrijimit = LocalDateTime.now();

    @Column(nullable = false)
    private String statusi = "active";

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<UserRole> userRoles;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<UserClaim> userClaims;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<UserToken> userTokens;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<RefreshToken> refreshTokens;
}

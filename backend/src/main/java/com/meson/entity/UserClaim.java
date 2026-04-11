package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class UserClaim{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="user_id",nullable=false)
    private User user;

    @Column(nullable = false)
    private String claimType;

    @Column(nullable = false)
    private String claimValue;
}

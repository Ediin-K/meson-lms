package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="user_id",nullable=false)
    private User user;

    @Column(nullable = false)
    private String loginProvider;

    @Column(nullable = false)
    private String tokenName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String tokenValue;

}

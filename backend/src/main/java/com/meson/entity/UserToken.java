package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"user"})
public class UserToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "login_provider", nullable = false)
    private String loginProvider;

    @Column(name = "token_name", nullable = false)
    private String tokenName;

    @Column(name = "token_value", nullable = false, columnDefinition = "TEXT")
    private String tokenValue;
}

package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"quiz", "answers"})
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String pyetja;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private QuizType lloji;

    @Column(name = "sequence_order", nullable = false)
    private Integer rradhitja;

    @Builder.Default
    @Column(name = "points", nullable = false)
    private Integer pikete = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Builder.Default
    @OneToMany(mappedBy = "question", fetch = FetchType.LAZY)
    private List<QuizAnswer> answers = new ArrayList<>();
}

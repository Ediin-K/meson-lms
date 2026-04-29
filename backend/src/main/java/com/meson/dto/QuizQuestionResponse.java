package com.meson.dto;

import com.meson.entity.QuizType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionResponse {
    private Long id;
    private String pyetja;
    private QuizType lloji;
    private Integer rradhitja;
    private Long quizId;
}
package com.meson.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResponse {
    private Long id;
    private String titulli;
    private Integer kohezgjatjaMinuta;
    private Long lessonId;
    private String lessonTitulli;
    private LocalDateTime createdAt;
}
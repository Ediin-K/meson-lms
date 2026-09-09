package com.meson.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssistantReviewResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long assistantId;
    private String assistantName;
    /** Null for the final review. */
    private LocalDate reviewDate;
    private boolean isFinal;
    private Integer stars;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

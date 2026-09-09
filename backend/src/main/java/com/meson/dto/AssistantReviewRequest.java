package com.meson.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AssistantReviewRequest {

    /** Null creates / updates the single final review; a date creates a dated log entry. */
    private LocalDate reviewDate;

    @Min(value = 1, message = "Vlerësimi duhet të jetë 1–5")
    @Max(value = 5, message = "Vlerësimi duhet të jetë 1–5")
    private Integer stars;

    private String comment;
}

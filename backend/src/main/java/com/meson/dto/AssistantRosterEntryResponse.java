package com.meson.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** One student on an assistant's combined roster for a subject, plus a summary of the assistant's own reviews for them. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssistantRosterEntryResponse {
    private Long studentId;
    private String studentName;
    private int reviewCount;
    private LocalDate lastReviewDate;
    private boolean hasFinal;
}

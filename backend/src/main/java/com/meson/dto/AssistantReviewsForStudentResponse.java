package com.meson.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Teacher-side view of a student's assistant reviews for one subject: the dated log plus the final. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssistantReviewsForStudentResponse {
    private List<AssistantReviewResponse> dated;
    private AssistantReviewResponse finalReview;
}

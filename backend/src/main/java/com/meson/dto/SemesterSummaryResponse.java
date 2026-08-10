package com.meson.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemesterSummaryResponse {
    private int semester;
    private List<GradeResponse> grades;
    private Double gpa;
    private int ects;
}

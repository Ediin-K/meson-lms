package com.meson.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectProgressResponse {
    private Long   subjectId;
    private String subjectTitulli;
    private int    totalLessons;
    private int    viewedLessons;
    private double progressPercent;
    private List<ModuleProgressResponse> modules;
}

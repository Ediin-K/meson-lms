package com.meson.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseProgressResponse {
    private Long   courseId;
    private String courseTitulli;
    private int    totalLessons;
    private int    viewedLessons;
    private double progressPercent;
    private List<ModuleProgressResponse> modules;
}

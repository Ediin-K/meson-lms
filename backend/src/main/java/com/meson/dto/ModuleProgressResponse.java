package com.meson.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleProgressResponse {
    private Long   moduleId;
    private String titulli;
    private int    totalLessons;
    private int    viewedLessons;
    private double progressPercent;
}

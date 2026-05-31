package com.meson.dto;

import lombok.*;

@Data
@AllArgsConstructor
@Builder
public class LessonViewResponse {
    private boolean courseCompleted;
    private String  certificateCode;
    private String  courseTitulli;
}

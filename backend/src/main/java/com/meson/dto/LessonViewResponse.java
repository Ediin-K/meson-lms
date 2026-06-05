package com.meson.dto;

import lombok.*;

@Data
@AllArgsConstructor
@Builder
public class LessonViewResponse {
    private boolean subjectCompleted;
    private String  certificateCode;
    private String  subjectTitulli;
}

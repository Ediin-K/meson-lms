package com.meson.dto;

import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentCreateRequest {
    private String title;
    private String description;
    private Instant deadline;
    private Long lessonId;
}

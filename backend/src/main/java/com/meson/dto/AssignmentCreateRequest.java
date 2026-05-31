package com.meson.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentCreateRequest {
    private String title;
    private String description;
    private LocalDateTime deadline;
    private Long lessonId;
}

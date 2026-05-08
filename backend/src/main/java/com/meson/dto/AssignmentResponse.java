package com.meson.dto;

import com.meson.entity.AssignmentStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentResponse {
    private Long id;
    private String titulli;
    private String pershkrimi;
    private String resourceUrl;
    private LocalDateTime deadline;
    private AssignmentStatus statusi;
    private Long lessonId;
    private String lessonTitulli;
    private LocalDateTime createdAt;
}
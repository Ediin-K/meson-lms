package com.meson.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private boolean hasAttachment;
    private String attachmentName;
    private Long lessonId;
    private String lessonTitle;
    private LocalDateTime createdAt;

    @JsonProperty("isOpen")
    private boolean isOpen;
}

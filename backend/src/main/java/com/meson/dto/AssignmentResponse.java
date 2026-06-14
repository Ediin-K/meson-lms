package com.meson.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {
    private Long id;
    private String title;
    private String description;
    private Instant deadline;
    private boolean hasAttachment;
    private String attachmentName;
    private Long lessonId;
    private String lessonTitle;
    private Instant createdAt;

    @JsonProperty("isOpen")
    private boolean isOpen;
}

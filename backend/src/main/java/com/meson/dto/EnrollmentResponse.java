// EnrollmentResponse.java
package com.meson.dto;

import com.meson.entity.EnrollmentStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentResponse {
    private Long id;
    private Long userId;
    private String userEmri;
    private Long courseId;
    private String courseTitulli;
    private Double progresi;
    private EnrollmentStatus statusi;
    private LocalDateTime dataRegjistrimit;
}
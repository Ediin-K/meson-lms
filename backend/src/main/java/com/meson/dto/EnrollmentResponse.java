
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
    private Long subjectId;
    private String subjectTitulli;
    private Integer subjectEcts;
    private Long subjectGroupId;
    private String subjectGroupName;
    private Long subjectSubgroupId;
    private String subjectSubgroupName;
    private String professorName;
    private String assistantName;
    private Double progresi;
    private EnrollmentStatus statusi;
    private LocalDateTime dataRegjistrimit;
}

package com.meson.dto;

import com.meson.entity.GradeAuditAction;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeAuditLogResponse {
    private Long id;
    private Long gradeId;
    private Long studentId;
    private String studentName;
    private Long subjectId;
    private String subjectTitulli;
    private Long performedById;
    private String performedByName;
    private GradeAuditAction action;
    private Integer previousGrade;
    private Integer newGrade;
    private String comment;
    private LocalDateTime performedAt;
}

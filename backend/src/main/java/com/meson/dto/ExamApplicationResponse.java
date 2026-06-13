package com.meson.dto;

import com.meson.entity.ExamApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamApplicationResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Integer courseEcts;
    private Integer semester;
    private String category;
    private Long professorId;
    private String professorName;
    private ExamApplicationStatus status;
    private LocalDateTime appliedAt;
    private Integer grade;
    private String gradeStatus;
    private String comment;
    private LocalDateTime gradeAssignedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime cancelledAt;
}

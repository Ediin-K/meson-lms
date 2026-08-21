package com.meson.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentHeadDashboardResponse {
    private Long departmentId;
    private String departmentName;
    private long subjectCount;
    private long teacherCount;
    private long studentCount;
}

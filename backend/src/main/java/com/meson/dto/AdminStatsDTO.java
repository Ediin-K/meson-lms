package com.meson.dto;

import lombok.*;
import java.util.List;

@Data
@AllArgsConstructor
public class AdminStatsDTO {
    private long totalUsers;
    private long totalCourses;
    private long totalEnrollments;
    private long totalStudents;
    private long totalTeachers;
    private long totalCertificates;
    private List<MonthlyCountDTO> enrollmentsByMonth;
    private List<NameValueDTO>    coursesByCategory;
    private List<NameValueDTO>    enrollmentsByStatus;
}

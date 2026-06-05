package com.meson.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentGroupWizardContextResponse {
    private Long departmentId;
    private String departmentName;
    private Integer semester;
    private List<SubjectResponse> subjects;
    private List<TeacherResponse> teachers;
}

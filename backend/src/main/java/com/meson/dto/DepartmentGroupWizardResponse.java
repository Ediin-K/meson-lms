package com.meson.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentGroupWizardResponse {
    private DepartmentGroupResponse group;
    private List<SubjectGroupResponse> subjectGroups;
    private List<ScheduleSessionResponse> schedules;
}

package com.meson.dto;

import com.meson.entity.GroupRequestStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentGroupStatusResponse {
    private boolean hasApprovedGroup;
    private boolean departmentAssigned;
    private Long departmentId;
    private String departmentName;
    private Integer currentSemester;
    private DepartmentGroupResponse approvedGroup;
    private StudentGroupRequestResponse pendingRequest;
}

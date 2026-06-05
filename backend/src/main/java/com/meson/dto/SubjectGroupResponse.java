package com.meson.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectGroupResponse {
    private Long id;
    private Long subjectId;
    private String name;
    private Integer capacity;
    private String schedule;
    private Long directionGroupId;
    private String directionGroupName;
    private List<AssignedTeacherResponse> teachers;
    private List<SubjectSubgroupResponse> subgroups;
}

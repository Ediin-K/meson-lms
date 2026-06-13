package com.meson.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectSubgroupResponse {
    private Long id;
    private Long subjectGroupId;
    private String name;
    private Integer capacity;
    private String schedule;
    private List<AssignedTeacherResponse> assistants;
}

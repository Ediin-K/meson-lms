package com.meson.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentGroupResponse {
    private Long id;
    private Long departmentId;
    private String departmentName;
    private Integer semester;
    private String name;
    private String description;
    private Integer maxCapacity;
    private Integer currentStudents;
    private Integer remainingSeats;
    private Boolean isFull;

    private String status;
}

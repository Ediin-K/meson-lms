package com.meson.dto;

import com.meson.entity.ScheduleSessionType;
import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleSessionResponse {
    private Long id;
    private Long subjectId;
    private String subjectTitle;
    private Long departmentId;
    private String departmentName;
    private Integer semester;
    private Long subjectGroupId;
    private String subjectGroupName;
    private Long subjectSubgroupId;
    private String subjectSubgroupName;
    private Long teacherId;
    private String teacherName;
    private ScheduleSessionType sessionType;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String room;
    private String color;
    private Integer capacity;
    private String status;
}

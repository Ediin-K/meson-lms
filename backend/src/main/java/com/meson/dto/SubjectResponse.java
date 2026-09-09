package com.meson.dto;

import com.meson.entity.SubjectStatus;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectResponse {
    private Long id;
    private String titulli;
    private String code;
    private String pershkrimi;
    /** Primary teacher = first in the pool. Kept for existing consumers. */
    private Long teacherId;
    private String teacherName;
    /** Full teacher pool, in order. */
    private List<TeacherRef> teachers;
    private Long departmentId;
    private Integer semester;
    private String enrollmentKey;
    private String departmentName;
    private Integer ects;
    private SubjectStatus statusi;
    private Integer moduleCount;
    private Integer studentCount;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TeacherRef {
        private Long id;
        private String name;
    }
}

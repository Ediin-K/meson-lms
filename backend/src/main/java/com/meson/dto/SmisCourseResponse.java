package com.meson.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmisCourseResponse {
    private Long id;
    private String code;
    private String name;
    private Integer ects;
    private Integer semester;
    private String category;
    private List<SmisProfessorOptionResponse> professors;
}

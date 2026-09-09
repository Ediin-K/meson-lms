package com.meson.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** One subject the current user assists on, with the section names they cover and the combined student count. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssistantSubjectResponse {
    private Long subjectId;
    private String subjectTitulli;
    private List<String> sectionNames;
    private int studentCount;
}

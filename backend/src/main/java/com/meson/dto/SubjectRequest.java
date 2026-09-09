package com.meson.dto;

import com.meson.entity.SubjectStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectRequest {

    @NotBlank(message="Titulli nuk mund te jet bosh")
    private String titulli;

    @Size(max = 20, message = "Kodi nuk mund te kaloj 20 karaktere")
    private String code;

    @Size(max = 500, message = "Pershkrimi nuk mund te kaloj 500 karaktere")
    private String pershkrimi;

    /** Legacy single-teacher field. {@code teacherIds} wins when both are present. */
    private Long teacherId;

    /** The subject's teacher pool, in order; the first is the primary. At least one required. */
    private List<Long> teacherIds;

    @NotNull
    private Long departmentId;

    @NotNull
    private Integer semester;

    @NotBlank(message = "Kodi i regjistrimit është i detyrueshëm")
    @Size(max = 255, message = "Kodi i regjistrimit nuk mund të kalojë 255 karaktere")
    private String enrollmentKey;

    @NotNull
    @Min(value = 1, message = "ECTS duhet te jete te pakten 1")
    @Max(value = 30, message = "ECTS nuk mund te kaloj 30")
    @Builder.Default
    private Integer ects = 5;

    @Builder.Default
    private SubjectStatus statusi = SubjectStatus.DRAFT;

}

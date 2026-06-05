package com.meson.dto;

import com.meson.entity.SubjectLevel;
import com.meson.entity.SubjectStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectRequest {

    @NotBlank(message="Titulli nuk mund te jet bosh")
    private String titulli;

    @Size(max = 500, message = "Pershkrimi nuk mund te kaloj 500 karaktere")
    private String pershkrimi;

    @NotNull
    private Long teacherId;

    @NotNull
    private Long departmentId;

    @NotNull
    private Integer semester;

    private String enrollmentKey;

    @NotNull
    @Min(value = 1, message = "ECTS duhet te jete te pakten 1")
    @Max(value = 30, message = "ECTS nuk mund te kaloj 30")
    @Builder.Default
    private Integer ects = 5;

    @Builder.Default
    private SubjectLevel niveli = SubjectLevel.FILLESTAR;

    @Builder.Default
    private SubjectStatus statusi = SubjectStatus.DRAFT;

}

package com.meson.dto;

import com.meson.entity.CourseLevel;
import com.meson.entity.CourseStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRequest {

    @NotBlank(message="Titulli nuk mund te jet bosh")
    private String titulli;

    @Size(max = 500, message = "Pershkrimi nuk mund te kaloj 500 karaktere")
    private String pershkrimi;

    @NotNull
    private Long teacherId;

    @NotNull
    private Long categoryId;

    @Builder.Default
    @DecimalMin(value = "0.0", message = "Cmimi nuk mund te jet negativ")
    private Double cmimi = 0.0;

    @Builder.Default
    private CourseLevel niveli = CourseLevel.FILLESTAR;

    @Builder.Default
    private CourseStatus statusi= CourseStatus.DRAFT;





}
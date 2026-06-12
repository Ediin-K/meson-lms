package com.meson.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmisProfessorOptionResponse {
    private Long id;
    private String name;
    private String email;
}

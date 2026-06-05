package com.meson.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DirectionResponse {
    private Long id;
    private String emertimi;
    private String pershkrimi;
}

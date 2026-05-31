package com.meson.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class MonthlyCountDTO {
    private String month;
    private long count;
}

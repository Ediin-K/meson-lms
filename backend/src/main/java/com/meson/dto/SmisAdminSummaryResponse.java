package com.meson.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmisAdminSummaryResponse {
    private long registered;
    private long graded;
    private long refused;
    private long cancelled;
    private long total;
}

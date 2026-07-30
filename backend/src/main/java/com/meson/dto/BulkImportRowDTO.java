package com.meson.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BulkImportRowDTO {
    private String emri;
    private String mbiemri;
    private String email;
    private String role;
    private String department;
    private Integer semester;
}

package com.meson.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String emri;
    private String mbiemri;
    private String email;
    private String statusi;
    private List<String> roles;
    private Long departmentId;
    private String departmentName;
    private Integer currentSemester;
    private LocalDateTime joined;
}

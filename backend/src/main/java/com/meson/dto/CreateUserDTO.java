package com.meson.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateUserDTO {
    private String emri;
    private String mbiemri;
    private String email;
    private String password;
    /** Single-role shorthand (bulk import, legacy callers). Ignored when {@code roles} is set. */
    private String role;
    /** Full role set (admin form). Takes precedence over {@code role}. */
    private List<String> roles;
    private String statusi;
    private Long departmentId;
    private Integer currentSemester;
}

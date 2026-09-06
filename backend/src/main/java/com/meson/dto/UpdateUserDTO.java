package com.meson.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateUserDTO {
    private String emri;
    private String mbiemri;
    private String email;
    private String phoneNumber;
    private String statusi;
    /** Single-role shorthand (legacy callers). Ignored when {@code roles} is set. */
    private String role;
    /** Full role set (admin form). Takes precedence over {@code role}; null = leave roles untouched. */
    private List<String> roles;
    private String password;
    private Long departmentId;
    private Integer currentSemester;
}

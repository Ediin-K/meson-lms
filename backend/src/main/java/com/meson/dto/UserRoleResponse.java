package com.meson.dto;

import lombok.Data;

@Data
public class UserRoleResponse{
    private Long id;
    private String emrii;
    private String mbiemer;
    private String email;
    private String role;
}
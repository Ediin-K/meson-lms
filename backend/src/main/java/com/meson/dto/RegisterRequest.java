package com.meson.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String emri;
    private String mbiemri;
    private String email;
    private String password;
    private String roli;
}
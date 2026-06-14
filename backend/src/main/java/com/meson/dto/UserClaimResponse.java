package com.meson.dto;

import lombok.Data;

@Data
public class UserClaimResponse {
    private Long id;
    private Long userId;
    private String emri;
    private String mbiemri;
    private String email;
    private String claimType;
    private String claimValue;
}

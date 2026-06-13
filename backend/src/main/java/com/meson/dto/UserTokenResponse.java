package com.meson.dto;

import lombok.Data;

@Data
public class UserTokenResponse {
    private Long id;
    private Long userId;
    private String emri;
    private String mbiemri;
    private String email;
    private String loginProvider;
    private String tokenName;
    private String tokenValue;
}

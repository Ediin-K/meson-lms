package com.meson.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserTokenRequest {

    @NotNull(message = "userId nuk mund te jet null")
    private Long userId;

    @NotBlank(message = "loginProvider nuk mund te jet bosh")
    private String loginProvider;

    @NotBlank(message = "tokenName nuk mund te jet bosh")
    private String tokenName;

    @NotBlank(message = "tokenValue nuk mund te jet bosh")
    private String tokenValue;
}

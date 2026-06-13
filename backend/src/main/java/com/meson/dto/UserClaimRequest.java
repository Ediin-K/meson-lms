package com.meson.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserClaimRequest {

    @NotNull(message = "userId nuk mund te jet null")
    private Long userId;

    @NotBlank(message = "claimType nuk mund te jet bosh")
    private String claimType;

    @NotBlank(message = "claimValue nuk mund te jet bosh")
    private String claimValue;
}

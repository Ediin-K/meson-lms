package com.meson.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private Long id;
    private String emri;
    private String mbiemri;
    private String email;
    private String phoneNumber;
    private String role;
    private boolean hasPhoto;
    /** Relative API path to fetch the avatar, or null. */
    private String photoUrl;
}

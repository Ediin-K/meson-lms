package com.meson.service;

import com.meson.dto.UserTokenResponse;
import com.meson.entity.UserToken;
import com.meson.repository.UserTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserTokenService {

    private final UserTokenRepository userTokenRepository;

    public List<UserTokenResponse> getAll() {
        return userTokenRepository.findAll().stream().map(this::toResponse).toList();
    }

    private UserTokenResponse toResponse(UserToken token) {
        UserTokenResponse r = new UserTokenResponse();
        r.setId(token.getId());
        r.setUserId(token.getUser().getId());
        r.setEmri(token.getUser().getEmri());
        r.setMbiemri(token.getUser().getMbiemri());
        r.setEmail(token.getUser().getEmail());
        r.setLoginProvider(token.getLoginProvider());
        r.setTokenName(token.getTokenName());
        r.setTokenValue(token.getTokenValue());
        return r;
    }
}

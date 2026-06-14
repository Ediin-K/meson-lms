package com.meson.service;

import com.meson.dto.UserTokenRequest;
import com.meson.dto.UserTokenResponse;
import com.meson.entity.User;
import com.meson.entity.UserToken;
import com.meson.repository.UserRepository;
import com.meson.repository.UserTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserTokenService {

    private final UserTokenRepository userTokenRepository;
    private final UserRepository userRepository;

    public List<UserTokenResponse> getAll() {
        return userTokenRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<UserTokenResponse> getByUserId(Long userId) {
        return userTokenRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    public UserTokenResponse getById(Long id) {
        UserToken token = userTokenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Token nuk u gjet"));
        return toResponse(token);
    }

    public UserTokenResponse create(UserTokenRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Useri nuk u gjet"));
        UserToken token = UserToken.builder()
                .user(user)
                .loginProvider(request.getLoginProvider())
                .tokenName(request.getTokenName())
                .tokenValue(request.getTokenValue())
                .build();
        return toResponse(userTokenRepository.save(token));
    }

    public UserTokenResponse update(Long id, UserTokenRequest request) {
        UserToken token = userTokenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Token nuk u gjet"));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Useri nuk u gjet"));
        token.setUser(user);
        token.setLoginProvider(request.getLoginProvider());
        token.setTokenName(request.getTokenName());
        token.setTokenValue(request.getTokenValue());
        return toResponse(userTokenRepository.save(token));
    }

    public void delete(Long id) {
        if (!userTokenRepository.existsById(id)) {
            throw new RuntimeException("Token nuk u gjet");
        }
        userTokenRepository.deleteById(id);
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

package com.meson.service;

import com.meson.dto.UserClaimRequest;
import com.meson.dto.UserClaimResponse;
import com.meson.entity.User;
import com.meson.entity.UserClaim;
import com.meson.repository.UserClaimRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserClaimService {

    private final UserClaimRepository userClaimRepository;
    private final UserRepository userRepository;

    public List<UserClaimResponse> getAll() {
        return userClaimRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<UserClaimResponse> getByUserId(Long userId) {
        return userClaimRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    public UserClaimResponse getById(Long id) {
        UserClaim claim = userClaimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim nuk u gjet"));
        return toResponse(claim);
    }

    public UserClaimResponse create(UserClaimRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Useri nuk u gjet"));
        UserClaim claim = UserClaim.builder()
                .user(user)
                .claimType(request.getClaimType())
                .claimValue(request.getClaimValue())
                .build();
        return toResponse(userClaimRepository.save(claim));
    }

    public UserClaimResponse update(Long id, UserClaimRequest request) {
        UserClaim claim = userClaimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim nuk u gjet"));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Useri nuk u gjet"));
        claim.setUser(user);
        claim.setClaimType(request.getClaimType());
        claim.setClaimValue(request.getClaimValue());
        return toResponse(userClaimRepository.save(claim));
    }

    public void delete(Long id) {
        if (!userClaimRepository.existsById(id)) {
            throw new RuntimeException("Claim nuk u gjet");
        }
        userClaimRepository.deleteById(id);
    }

    private UserClaimResponse toResponse(UserClaim claim) {
        UserClaimResponse r = new UserClaimResponse();
        r.setId(claim.getId());
        r.setUserId(claim.getUser().getId());
        r.setEmri(claim.getUser().getEmri());
        r.setMbiemri(claim.getUser().getMbiemri());
        r.setEmail(claim.getUser().getEmail());
        r.setClaimType(claim.getClaimType());
        r.setClaimValue(claim.getClaimValue());
        return r;
    }
}

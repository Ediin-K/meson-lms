package com.meson.service;

import com.meson.entity.User;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void activate(Long id) {
        User user = getById(id);
        user.setStatusi("active");
        userRepository.save(user);
    }

    public void deactivate(Long id) {
        User user = getById(id);
        user.setStatusi("inactive");
        userRepository.save(user);
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User nuk u gjet"));
    }

    public User create(User user) {
        if (userRepository.existsByEmailIgnoreCase(user.getEmail())) {
            throw new RuntimeException("Email ekziston tashmë");
        }
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setDataKrijimit(LocalDateTime.now());
        user.setStatusi("active");
        return userRepository.save(user);
    }

    public User update(Long id, User updated) {
        User user = getById(id);
        user.setEmri(updated.getEmri());
        user.setMbiemri(updated.getMbiemri());
        user.setPhoneNumber(updated.getPhoneNumber());
        user.setStatusi(updated.getStatusi());
        return userRepository.save(user);
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}
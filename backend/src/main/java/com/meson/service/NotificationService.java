package com.meson.service;

import com.meson.dto.NotificationResponse;
import com.meson.entity.Notification;
import com.meson.entity.User;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.NotificationRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void create(User recipient, String title, String message) {
        notificationRepository.save(Notification.builder()
                .user(recipient)
                .title(title)
                .message(message)
                .build());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByUserIdAndReadFalse(getCurrentUser().getId());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getForUser() {
        Long userId = getCurrentUser().getId();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Njoftimi nuk u gjet"));
        if (!notification.getUser().getId().equals(getCurrentUser().getId())) {
            throw new AccessDeniedException("Ju nuk keni qasje ne kete njoftim");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        notificationRepository.markAllAsReadForUser(getCurrentUser().getId());
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Perdoruesi nuk u gjet."));
    }
}

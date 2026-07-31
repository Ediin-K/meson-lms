package com.meson;

import com.meson.entity.User;
import com.meson.service.EmailService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class EmailServiceTest {

    private User sampleUser() {
        User user = new User();
        user.setEmri("Test");
        user.setMbiemri("Student");
        user.setEmail("teststudent@test.com");
        return user;
    }

    @Test
    void doesNotSendWhenMailDisabled() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        EmailService emailService = new EmailService(mailSender, false, "no-reply@test.com");

        emailService.sendTempPasswordEmail(sampleUser(), "tempPass123");

        verifyNoInteractions(mailSender);
    }

    @Test
    void sendsMessageWithTempPasswordWhenEnabled() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        EmailService emailService = new EmailService(mailSender, true, "no-reply@test.com");

        emailService.sendTempPasswordEmail(sampleUser(), "tempPass123");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getTo()).containsExactly("teststudent@test.com");
        assertThat(sent.getFrom()).isEqualTo("no-reply@test.com");
        assertThat(sent.getText()).contains("tempPass123");
    }
}

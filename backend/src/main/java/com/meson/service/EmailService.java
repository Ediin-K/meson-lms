package com.meson.service;

import com.meson.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final boolean mailEnabled;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender,
                         @Value("${mail.enabled}") boolean mailEnabled,
                         @Value("${mail.from}") String fromAddress) {
        this.mailSender = mailSender;
        this.mailEnabled = mailEnabled;
        this.fromAddress = fromAddress;
    }

    /** No-ops when mail.enabled=false (default until a real provider/API key is configured). */
    public void sendTempPasswordEmail(User user, String tempPassword) {
        if (!mailEnabled) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("Llogaria juaj në Meson LMS");
        message.setText(
                "Përshëndetje " + user.getEmri() + " " + user.getMbiemri() + ",\n\n"
                        + "Llogaria juaj në Meson LMS u krijua.\n"
                        + "Email: " + user.getEmail() + "\n"
                        + "Fjalëkalimi i përkohshëm: " + tempPassword + "\n\n"
                        + "Ju lutem kyçuni dhe ndryshoni fjalëkalimin sa më shpejt."
        );

        mailSender.send(message);
    }
}

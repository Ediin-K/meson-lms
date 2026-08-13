package com.meson.service;

import com.meson.entity.Subject;
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

    /** No-ops when mail.enabled=false. Fired when a grade is first posted for a student. */
    public void sendGradePostedEmail(User student, Subject subject, int grade) {
        if (!mailEnabled) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(student.getEmail());
        message.setSubject("Nota juaj u vendos: " + subject.getTitulli());
        message.setText(
                "Përshëndetje " + student.getEmri() + " " + student.getMbiemri() + ",\n\n"
                        + "Nota juaj për lëndën \"" + subject.getTitulli() + "\" u vendos: " + grade + ".\n\n"
                        + "Kyçuni në Meson LMS për të parë detajet e plota."
        );

        mailSender.send(message);
    }

    /** No-ops when mail.enabled=false. Fired when a student's enrollment in a subject is created. */
    public void sendEnrollmentConfirmedEmail(User student, Subject subject) {
        if (!mailEnabled) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(student.getEmail());
        message.setSubject("Regjistrimi u konfirmua: " + subject.getTitulli());
        message.setText(
                "Përshëndetje " + student.getEmri() + " " + student.getMbiemri() + ",\n\n"
                        + "Regjistrimi juaj në lëndën \"" + subject.getTitulli() + "\" u konfirmua.\n\n"
                        + "Kyçuni në Meson LMS për të parë detajet e plota."
        );

        mailSender.send(message);
    }
}

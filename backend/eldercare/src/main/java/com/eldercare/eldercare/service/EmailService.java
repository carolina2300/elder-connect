package com.eldercare.eldercare.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendNewMessageNotification(String toEmail, String senderName) {
        log.info("Sending Email to {}", toEmail);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("cuidado.senior.pt@gmail.com");
        message.setTo(toEmail);
        message.setSubject("You have a new message on Eldercare!");
        message.setText("""
                Hi,
                
                You have received a new message from %s on Eldercare.
                
                Please log in to view and reply to your message.
                
                Best regards,
                The Eldercare Team
                """.formatted(senderName));


        try {
            mailSender.send(message);
            log.info("Email sent successfully");
        } catch (Exception e) {
            log.error("Failed to send email", e);
        }
    }
}

package com.eldercare.eldercare.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendNewMessageNotification(String toEmail, String senderName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("test@example.com");
        message.setTo(toEmail);
        message.setSubject("You have a new message on Eldercare!");
        message.setText("""
                Hi,
                
                You have received a new message from %s on Eldercare.
                
                Please log in to view and reply to your message.
                
                Best regards,
                The Eldercare Team
                """.formatted(senderName));

        mailSender.send(message);
    }
}

package com.eldercare.eldercare.service;

import com.eldercare.eldercare.model.EmailNotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class KafkaEmailConsumer {
    private final EmailService emailService;

    public KafkaEmailConsumer(EmailService emailService) {
        this.emailService = emailService;
    }

    @KafkaListener(
            topics = "email-notifications",
            groupId = "email-service"
    )
    public void consume(EmailNotificationEvent event) {

        log.info("Received event: {}", event);

        emailService.sendNewMessageNotification(
                event.recipientEmail(),
                event.senderName()
        );
        log.info("Successful email sent to {}", event.recipientEmail() );
    }
    
}

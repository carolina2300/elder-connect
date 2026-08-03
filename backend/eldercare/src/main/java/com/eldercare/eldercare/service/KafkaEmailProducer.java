package com.eldercare.eldercare.service;

import com.eldercare.eldercare.model.EmailNotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class KafkaEmailProducer {
    private final KafkaTemplate<String, EmailNotificationEvent> kafkaTemplate;

    public KafkaEmailProducer(
            KafkaTemplate<String, EmailNotificationEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendEmailNotification(EmailNotificationEvent event) {
        log.info("Publishing EmailNotificationEvent for recipient {}",
                event.recipientEmail());

        kafkaTemplate.send(
                "email-notifications",
                event.recipientEmail(),
                event
        );
    }
}

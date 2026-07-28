package com.eldercare.eldercare.model;

public record EmailNotificationEvent(
        String recipientEmail,
        String senderName
) {
}

package com.eldercare.eldercare.exception;

import java.util.UUID;

public class ConversationNotFoundException extends RuntimeException {
    public ConversationNotFoundException(UUID id) {
        super("Conversation not found: " + id);
    }
}

package com.eldercare.eldercare.dto;

import java.time.Instant;
import java.util.UUID;

public record MessageDto(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String body,
        Instant sentAt,
        Instant readAt
) {}

package com.eldercare.eldercare.dto;

import java.time.Instant;
import java.util.UUID;

public record ConversationDto(
        UUID id,
        UUID participantAId,
        UUID participantBId,
        Instant createdAt
) {}

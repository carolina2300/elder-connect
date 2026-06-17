package com.eldercare.eldercare.dto;

import java.time.Instant;
import java.util.UUID;

public record ReviewDto(
        UUID id,
        UUID reviewerId,
        UUID reviewedId,
        short rating,
        String text,
        Instant createdAt
) {}

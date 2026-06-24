package com.eldercare.eldercare.dto;

import com.eldercare.eldercare.model.UserType;

import java.time.Instant;
import java.util.UUID;

public record UserDto(
        UUID id,
        String email,
        String name,
        String description,
        String photo,
        String phoneNumber,
        UserType role,
        Instant createdAt
) {}

package com.eldercare.eldercare.dto;

import com.eldercare.eldercare.model.UserType;

import java.time.Instant;

public record UserDto(
        Long id,
        String email,
        String name,
        String description,
        String photo,
        String phoneNumber,
        UserType userType,
        Instant createdAt
) {}

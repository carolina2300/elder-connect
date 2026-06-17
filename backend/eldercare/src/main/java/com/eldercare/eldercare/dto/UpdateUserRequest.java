package com.eldercare.eldercare.dto;

public record UpdateUserRequest(
        String name,
        String description,
        String photo,
        String phoneNumber
) {}

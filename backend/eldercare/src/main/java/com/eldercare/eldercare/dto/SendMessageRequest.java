package com.eldercare.eldercare.dto;

import jakarta.validation.constraints.NotBlank;

public record SendMessageRequest(@NotBlank String body) {}

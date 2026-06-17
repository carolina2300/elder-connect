package com.eldercare.eldercare.auth;

import com.eldercare.eldercare.model.UserType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank String password,
        String description,
        String photo,
        @NotNull UserType role
) {}

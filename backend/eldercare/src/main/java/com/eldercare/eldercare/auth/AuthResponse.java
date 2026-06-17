package com.eldercare.eldercare.auth;

import com.eldercare.eldercare.dto.UserDto;

public record AuthResponse(UserDto user, String token) {}

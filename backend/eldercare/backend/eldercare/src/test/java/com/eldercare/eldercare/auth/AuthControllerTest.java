package com.eldercare.eldercare.auth;

import com.eldercare.eldercare.dto.UserDto;
import com.eldercare.eldercare.model.UserType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    AuthService authService;

    @InjectMocks
    AuthController victim;

    private AuthResponse authResponse() {
        UserDto user = new UserDto(UUID.randomUUID(), "john@test.com", "John", null, null,
                null, UserType.CARE_SEEKER, Instant.now());
        return new AuthResponse(user, "token-123");
    }

    @Test
    public void register_returnsCreated() {
        RegisterRequest req = new RegisterRequest("John", "john@test.com", "secret",
                null, null, UserType.CARE_SEEKER);
        AuthResponse response = authResponse();
        when(authService.register(req)).thenReturn(response);

        ResponseEntity<AuthResponse> result = victim.register(req);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertEquals(response, result.getBody());
    }

    @Test
    public void login_returnsOk() {
        LoginRequest req = new LoginRequest("john@test.com", "secret");
        AuthResponse response = authResponse();
        when(authService.login(req)).thenReturn(response);

        ResponseEntity<AuthResponse> result = victim.login(req);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(response, result.getBody());
    }

    @Test
    public void logout_returnsNoContent() {
        ResponseEntity<Void> result = victim.logout();

        assertEquals(HttpStatus.NO_CONTENT, result.getStatusCode());
    }
}

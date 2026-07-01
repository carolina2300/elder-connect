package com.eldercare.eldercare.controller;

import com.eldercare.eldercare.dto.UpdateUserRequest;
import com.eldercare.eldercare.dto.UserDto;
import com.eldercare.eldercare.model.UserType;
import com.eldercare.eldercare.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    UserService userService;

    @Mock
    Authentication authentication;

    @InjectMocks
    UserController victim;

    private UserDto userDto(UUID id) {
        return new UserDto(id, "test@email.com", "John", "about", "photo",
                "123", UserType.CARE_SEEKER, Instant.now());
    }

    @Test
    public void findAll_delegatesToService() {
        UserDto dto = userDto(UUID.randomUUID());
        when(userService.findAll()).thenReturn(List.of(dto));

        List<UserDto> result = victim.findAll();

        assertEquals(1, result.size());
        assertEquals(dto, result.get(0));
    }

    @Test
    public void findUser_whenFound_returnsOk() {
        UUID id = UUID.randomUUID();
        UserDto dto = userDto(id);
        when(userService.findById(id)).thenReturn(Optional.of(dto));

        ResponseEntity<UserDto> result = victim.findUser(id);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(dto, result.getBody());
    }

    @Test
    public void findUser_whenMissing_returnsNotFound() {
        UUID id = UUID.randomUUID();
        when(userService.findById(id)).thenReturn(Optional.empty());

        ResponseEntity<UserDto> result = victim.findUser(id);

        assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode());
    }

    @Test
    public void update_passesRequesterIdFromAuth() {
        UUID id = UUID.randomUUID();
        UpdateUserRequest req = new UpdateUserRequest("marie", null, null, "000");
        UserDto dto = userDto(id);
        when(authentication.getPrincipal()).thenReturn(id);
        when(userService.update(id, id, req)).thenReturn(dto);

        UserDto result = victim.update(id, req, authentication);

        assertEquals(dto, result);
    }
}

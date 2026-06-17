 package com.eldercare.eldercare.controller;

import com.eldercare.eldercare.dto.UpdateUserRequest;
import com.eldercare.eldercare.dto.UserDto;
import com.eldercare.eldercare.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserDto> findAll() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> findUser(@PathVariable UUID id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public UserDto update(@PathVariable UUID id,
                          @RequestBody UpdateUserRequest req,
                          Authentication auth) {
        UUID requesterId = (UUID) auth.getPrincipal();
        return userService.update(id, requesterId, req);
    }
}

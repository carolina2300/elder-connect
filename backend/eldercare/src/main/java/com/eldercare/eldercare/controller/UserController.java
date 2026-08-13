 package com.eldercare.eldercare.controller;

import com.eldercare.eldercare.dto.UpdateUserRequest;
import com.eldercare.eldercare.dto.UserDto;
import com.eldercare.eldercare.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserDto> findAll() {
        log.info("operation=findAll");
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

    @PatchMapping("/{id}/photo")
    public ResponseEntity<UserDto> uploadPhoto(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            Authentication auth) throws IOException {
        log.info("Uploading file for user {}", id);

        UUID requesterId = (UUID) auth.getPrincipal();

        // only allow users to update their own photo
        if (!requesterId.equals(id)) {
            log.error("cannot update photo for another user");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(userService.updatePhoto(id, file));
    }
}

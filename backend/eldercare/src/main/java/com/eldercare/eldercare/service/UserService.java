package com.eldercare.eldercare.service;

import com.eldercare.eldercare.dto.UpdateUserRequest;
import com.eldercare.eldercare.dto.UserDto;
import com.eldercare.eldercare.model.User;
import com.eldercare.eldercare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private static final int MAX_FILE_SIZE = 5 * 1024 * 1024; // validate file size (max 5MB)
    private final UserRepository userRepository;
    private final StorageService storageService;

    public List<UserDto> findAll() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public Optional<UserDto> findById(UUID id) {
        return userRepository.findById(id).map(this::toDto);
    }

    public UserDto update(UUID id, UUID requesterId, UpdateUserRequest req) {
        if (!id.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        log.info("Update user {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (req.name() != null && !req.name().isBlank()) user.setName(req.name());
        if (req.description() != null) user.setDescription(req.description());
        if (req.photo() != null) user.setPhoto(req.photo());
        if (req.phoneNumber() != null) user.setPhoneNumber(req.phoneNumber());
        return toDto(userRepository.save(user));
    }

    @Transactional
    public UserDto updatePhoto(UUID userId, MultipartFile file) throws IOException {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size must be less than 5MB");
        }

        // validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // delete old photo if exists
        if (user.getPhoto() != null) {
            storageService.deletePhoto(user.getPhoto());
        }

        // upload new photo
        String photoUrl = storageService.uploadPhoto(userId, file);
        user.setPhoto(photoUrl);

        return toDto(userRepository.save(user));
    }

    private UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getDescription(),
                user.getPhoto(),
                user.getPhoneNumber(),
                user.getUserType(),
                user.getCreatedAt()
        );
    }
}

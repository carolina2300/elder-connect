package com.eldercare.eldercare.service;

import com.eldercare.eldercare.dto.UpdateUserRequest;
import com.eldercare.eldercare.dto.UploadPhotoResponse;
import com.eldercare.eldercare.dto.UserDto;
import com.eldercare.eldercare.model.User;
import com.eldercare.eldercare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StorageService storageService;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

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
        if (req.phoneNumber() != null) user.setPhoneNumber(req.phoneNumber());
        return toDto(userRepository.save(user));
    }

    public UploadPhotoResponse generateUploadPhotoUrl(UUID userId, String contentType){
        log.info("Generating upload photo url for user {}", userId);
        if (!ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported image type. Allowed: JPEG, PNG, WebP"
            );
        }

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "User not found")
                );

        String extension = getExtensionFromContentType(contentType);

        String key = "users/" + userId + "/photo/" + UUID.randomUUID() + extension;

        String uploadUrl = storageService.generateUploadPhotoUrl(key, contentType);

        return new UploadPhotoResponse(uploadUrl, key);
    }

    @Transactional
    public UserDto confirmUploadPhoto(UUID userId, String photoName) {
        log.info("Confirm upload photo for user {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Delete old photo
        if (user.getPhoto() != null) {
            storageService.deletePhoto(user.getPhoto());
        }

        user.setPhoto(photoName);

        return toDto(userRepository.save(user));
    }

    private String getExtensionFromContentType(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new IllegalArgumentException("Unsupported image type: " + contentType);
        };
    }

    private UserDto toDto(User user) {
        String photoUrl = storageService.generateGetPhotoUrl(user.getPhoto());

        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getDescription(),
                photoUrl,
                user.getPhoneNumber(),
                user.getUserType(),
                user.getCreatedAt()
        );
    }
}

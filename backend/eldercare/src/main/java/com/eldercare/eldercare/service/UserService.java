package com.eldercare.eldercare.service;

import com.eldercare.eldercare.dto.UpdateUserRequest;
import com.eldercare.eldercare.dto.UserDto;
import com.eldercare.eldercare.model.User;
import com.eldercare.eldercare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (req.name() != null && !req.name().isBlank()) user.setName(req.name());
        if (req.description() != null) user.setDescription(req.description());
        if (req.photo() != null) user.setPhoto(req.photo());
        if (req.phoneNumber() != null) user.setPhoneNumber(req.phoneNumber());
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

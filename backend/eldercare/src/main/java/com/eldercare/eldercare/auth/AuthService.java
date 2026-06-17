package com.eldercare.eldercare.auth;

import com.eldercare.eldercare.dto.UserDto;
import com.eldercare.eldercare.exception.EmailAlreadyRegisteredException;
import com.eldercare.eldercare.exception.InvalidCredentialsException;
import com.eldercare.eldercare.model.User;
import com.eldercare.eldercare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new EmailAlreadyRegisteredException(request.email());
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setDescription(request.description());
        user.setPhoto(request.photo());
        user.setUserType(request.role());
        user.setCreatedAt(Instant.now());

        User saved = userRepository.save(user);
        String token = jwtService.issue(saved.getId());
        return new AuthResponse(toDto(saved), token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtService.issue(user.getId());
        return new AuthResponse(toDto(user), token);
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

package com.eldercare.eldercare.auth;

import com.eldercare.eldercare.exception.EmailAlreadyRegisteredException;
import com.eldercare.eldercare.exception.InvalidCredentialsException;
import com.eldercare.eldercare.model.User;
import com.eldercare.eldercare.model.UserType;
import com.eldercare.eldercare.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    JwtService jwtService;

    @InjectMocks
    AuthService victim;

    private RegisterRequest registerRequest() {
        return new RegisterRequest("John", "john@test.com", "secret",
                "about", "photo.png", UserType.CARE_SEEKER);
    }

    @Test
    public void register_whenEmailExists_throws() {
        RegisterRequest req = registerRequest();
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(new User()));

        assertThrows(EmailAlreadyRegisteredException.class, () -> victim.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    public void register_encodesPasswordSavesAndIssuesToken() {
        RegisterRequest req = registerRequest();
        UUID id = UUID.randomUUID();
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("secret")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(id);
            return u;
        });
        when(jwtService.issue(id)).thenReturn("token-123");

        AuthResponse result = victim.register(req);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals("encoded", captor.getValue().getPassword());
        assertEquals("john@test.com", captor.getValue().getEmail());
        assertEquals(UserType.CARE_SEEKER, captor.getValue().getUserType());

        assertEquals("token-123", result.token());
        assertEquals(id, result.user().id());
        assertEquals("john@test.com", result.user().email());
    }

    @Test
    public void login_whenUserNotFound_throws() {
        LoginRequest req = new LoginRequest("missing@test.com", "secret");
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> victim.login(req));
    }

    @Test
    public void login_whenPasswordWrong_throws() {
        LoginRequest req = new LoginRequest("john@test.com", "wrong");
        User user = User.builder().id(UUID.randomUUID()).email("john@test.com").password("encoded").build();
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> victim.login(req));
        verify(jwtService, never()).issue(any());
    }

    @Test
    public void login_whenCredentialsValid_returnsToken() {
        UUID id = UUID.randomUUID();
        LoginRequest req = new LoginRequest("john@test.com", "secret");
        User user = User.builder().id(id).email("john@test.com").password("encoded").build();
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "encoded")).thenReturn(true);
        when(jwtService.issue(id)).thenReturn("token-xyz");

        AuthResponse result = victim.login(req);

        assertEquals("token-xyz", result.token());
        assertEquals(id, result.user().id());
    }
}

package com.eldercare.eldercare.service;


import com.eldercare.eldercare.dto.UpdateUserRequest;
import com.eldercare.eldercare.dto.UserDto;
import com.eldercare.eldercare.model.User;
import com.eldercare.eldercare.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    UserRepository userRepository;

    @InjectMocks
    UserService victim;

    @Test
    public void findAll_whenNoUsersExist_returnsEmptyList(){
        List<User> users = new ArrayList<>();
        when(userRepository.findAll()).thenReturn(users);

        List<UserDto> result = victim.findAll();

        assertTrue(result.isEmpty());
    }

    @Test
    public void findAll_returnsOneUserAsDto(){
        UUID id = UUID.randomUUID();
        List<User> users = List.of(User.builder()
                        .id(id)
                        .email("test@email.com")
                .build());
        when(userRepository.findAll()).thenReturn(users);

        List<UserDto> result = victim.findAll();

        assertEquals(1, result.size());
        assertEquals("test@email.com", result.get(0).email());
        assertEquals(id, result.get(0).id());
    }

    @Test
    public void findAll_returnsTwoUserAsDtos(){
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        List<User> users = List.of(
                User.builder()
                        .id(id1)
                        .email("test1@email.com")
                        .build(),
                User.builder()
                        .id(id2)
                        .email("test2@email.com")
                        .build()
                );
        when(userRepository.findAll()).thenReturn(users);

        List<UserDto> result = victim.findAll();

        assertEquals(2, result.size());
        assertEquals("test1@email.com", result.get(0).email());
        assertEquals(id1, result.get(0).id());
        assertEquals("test2@email.com", result.get(1).email());
        assertEquals(id2, result.get(1).id());
    }

    @Test
    public void findById_returnsUserDto(){
        UUID id = UUID.randomUUID();
        User user = User.builder()
                .id(id)
                .email("test@email.com")
                .build();

        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        Optional<UserDto> result = victim.findById(id);

        assertTrue(result.isPresent());
        assertEquals(id, result.get().id());
        assertEquals("test@email.com", result.get().email());
    }

    @Test
    public void update_returnsUpdatedElements(){
        UUID id = UUID.randomUUID();
        User user = User.builder()
                .email("email@test.com")
                .name("John")
                .description("teste teste")
                .phoneNumber("123")
                .build();
        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        User userUpdated = User.builder()
                .email("email@test.com")
                .name("marie")
                .description("teste teste")
                .phoneNumber("000")
                .build();
        when(userRepository.save(user)).thenReturn(userUpdated);


        UpdateUserRequest req = new UpdateUserRequest("marie", null, null, "000");

        UserDto result = victim.update(id, id, req);




    }
}
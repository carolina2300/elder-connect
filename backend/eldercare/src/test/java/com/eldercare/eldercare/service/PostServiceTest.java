package com.eldercare.eldercare.service;

import com.eldercare.eldercare.dto.CreatePostRequest;
import com.eldercare.eldercare.dto.PostDto;
import com.eldercare.eldercare.model.Post;
import com.eldercare.eldercare.model.PostKind;
import com.eldercare.eldercare.model.PostStatus;
import com.eldercare.eldercare.model.User;
import com.eldercare.eldercare.repository.PostRepository;
import com.eldercare.eldercare.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    private static final UUID ID1 = UUID.randomUUID();
    private static final Post CARETAKER_POST = Post.builder()
            .id(ID1)
            .description("description")
            .kind(PostKind.CARETAKER)
            .build();

    private static final UUID ID2 = UUID.randomUUID();
    private static final Post CAREGIVER_POST = Post.builder()
            .id(ID1)
            .description("description 2")
            .kind(PostKind.CAREGIVER)
            .build();

    private static final PostDto CAREGIVER_POST_DTO = new PostDto(ID1, null, PostKind.CAREGIVER, null, null,
            "description", null, null, null,
            null, null, null,
            null, null, null, null, null);;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final User USER = User.builder()
            .id(USER_ID)
            .name("name")
            .build();

    @Mock
    PostRepository postRepository;

    @Mock
    UserRepository userRepository;

    @Mock
    PostMapper postMapper;

    @InjectMocks
    PostService victim;


    @Test
    void throwExceptionWhenUserNotFound() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());
        CreatePostRequest postRequest = new CreatePostRequest(PostKind.CAREGIVER, "desc", null, null, null,
                null, null, null, null, null, null, null, null);


        assertThrows(IllegalStateException.class, () -> victim.create(id, postRequest));

        verifyNoInteractions(postMapper, postRepository);
    }

    @Test
    void createCareGiverPost() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(USER));
        when(postRepository.save(any())).thenReturn(CAREGIVER_POST);
        when(postMapper.toDto(CAREGIVER_POST)).thenReturn(CAREGIVER_POST_DTO);

        CreatePostRequest postRequest = new CreatePostRequest(PostKind.CAREGIVER, "description", null, null, null,
                null, null, null, null, null, null, null, null);


        PostDto result = victim.create(USER_ID, postRequest);

        assertEquals(ID1, result.id());
        assertEquals(PostKind.CAREGIVER, result.kind());
        assertEquals("description", result.description());

    }
}
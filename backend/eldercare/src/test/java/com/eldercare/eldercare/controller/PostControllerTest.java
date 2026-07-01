package com.eldercare.eldercare.controller;

import com.eldercare.eldercare.dto.CreatePostRequest;
import com.eldercare.eldercare.dto.PageResponse;
import com.eldercare.eldercare.dto.PostDto;
import com.eldercare.eldercare.model.PostKind;
import com.eldercare.eldercare.model.PostStatus;
import com.eldercare.eldercare.service.PostService;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostControllerTest {

    @Mock
    PostService postService;

    @Mock
    Authentication authentication;

    @InjectMocks
    PostController victim;

    private PostDto postDto(UUID id, UUID authorId) {
        return new PostDto(id, authorId, PostKind.CAREGIVER, PostStatus.OPEN, Instant.now(),
                "desc", null, null, null,
                null, null, null,
                null, null, null, null, null);
    }

    private CreatePostRequest createPostRequest() {
        return new CreatePostRequest(PostKind.CAREGIVER, "desc", null, null, null,
                null, null, null, null, null, null, null, null);
    }

    @Test
    public void create_returnsCreatedWithAuthorFromAuth() {
        UUID authorId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();
        CreatePostRequest req = createPostRequest();
        PostDto dto = postDto(postId, authorId);
        when(authentication.getPrincipal()).thenReturn(authorId);
        when(postService.create(authorId, req)).thenReturn(dto);

        ResponseEntity<PostDto> result = victim.create(req, authentication);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertEquals(dto, result.getBody());
    }

    @Test
    public void search_delegatesToService() {
        PostDto dto = postDto(UUID.randomUUID(), UUID.randomUUID());
        PageResponse<PostDto> page = new PageResponse<>(List.of(dto), 0, 10, 1, 1);
        when(postService.search(null, null, null, null, null, null, null, null, null,
                "recent", 0, 10)).thenReturn(page);

        PageResponse<PostDto> result = victim.search(null, null, null, null, null, null, null,
                null, null, "recent", 0, 10);

        assertEquals(page, result);
    }

    @Test
    public void findById_whenFound_returnsOk() {
        UUID id = UUID.randomUUID();
        PostDto dto = postDto(id, UUID.randomUUID());
        when(postService.findById(id)).thenReturn(Optional.of(dto));

        ResponseEntity<PostDto> result = victim.findById(id);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(dto, result.getBody());
    }

    @Test
    public void findById_whenMissing_returnsNotFound() {
        UUID id = UUID.randomUUID();
        when(postService.findById(id)).thenReturn(Optional.empty());

        ResponseEntity<PostDto> result = victim.findById(id);

        assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode());
    }

    @Test
    public void delete_passesRequesterIdAndReturnsNoContent() {
        UUID id = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        when(authentication.getPrincipal()).thenReturn(requesterId);

        ResponseEntity<Void> result = victim.delete(id, authentication);

        assertEquals(HttpStatus.NO_CONTENT, result.getStatusCode());
        verify(postService).delete(id, requesterId);
    }
}

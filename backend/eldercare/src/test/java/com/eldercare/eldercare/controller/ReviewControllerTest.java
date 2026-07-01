package com.eldercare.eldercare.controller;

import com.eldercare.eldercare.dto.CreateReviewRequest;
import com.eldercare.eldercare.dto.ReviewDto;
import com.eldercare.eldercare.service.ReviewService;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewControllerTest {

    @Mock
    ReviewService reviewService;

    @Mock
    Authentication authentication;

    @InjectMocks
    ReviewController victim;

    @Test
    public void create_returnsCreatedWithReviewerFromAuth() {
        UUID reviewerId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        CreateReviewRequest req = new CreateReviewRequest((short) 5, "great");
        ReviewDto dto = new ReviewDto(UUID.randomUUID(), reviewerId, userId, (short) 5, "great", Instant.now());
        when(authentication.getPrincipal()).thenReturn(reviewerId);
        when(reviewService.create(reviewerId, userId, req)).thenReturn(dto);

        ResponseEntity<ReviewDto> result = victim.create(userId, req, authentication);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertEquals(dto, result.getBody());
    }

    @Test
    public void findByUser_delegatesToService() {
        UUID userId = UUID.randomUUID();
        ReviewDto dto = new ReviewDto(UUID.randomUUID(), UUID.randomUUID(), userId, (short) 4, "ok", Instant.now());
        when(reviewService.findByUser(userId)).thenReturn(List.of(dto));

        List<ReviewDto> result = victim.findByUser(userId);

        assertEquals(1, result.size());
        assertEquals(dto, result.get(0));
    }
}

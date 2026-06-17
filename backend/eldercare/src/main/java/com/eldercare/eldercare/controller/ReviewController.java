package com.eldercare.eldercare.controller;

import com.eldercare.eldercare.dto.CreateReviewRequest;
import com.eldercare.eldercare.dto.ReviewDto;
import com.eldercare.eldercare.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/{userId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDto> create(@PathVariable UUID userId,
                                            @Valid @RequestBody CreateReviewRequest req,
                                            Authentication auth) {
        UUID reviewerId = (UUID) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.create(reviewerId, userId, req));
    }

    @GetMapping
    public List<ReviewDto> findByUser(@PathVariable UUID userId) {
        return reviewService.findByUser(userId);
    }
}

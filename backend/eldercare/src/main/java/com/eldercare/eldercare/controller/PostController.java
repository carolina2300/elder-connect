package com.eldercare.eldercare.controller;

import com.eldercare.eldercare.dto.CreatePostRequest;
import com.eldercare.eldercare.dto.PageResponse;
import com.eldercare.eldercare.dto.PostDto;
import com.eldercare.eldercare.model.Qualification;
import com.eldercare.eldercare.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostDto> create(@Valid @RequestBody CreatePostRequest req, Authentication auth) {
        UUID authorId = (UUID) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(authorId, req));
    }

    @GetMapping
    public PageResponse<PostDto> search(
            @RequestParam(required = false) String distrito,
            @RequestParam(required = false) String concelho,
            @RequestParam(required = false) String freguesia,
            @RequestParam(required = false) List<Qualification> qualifications,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availableOn,
            @RequestParam(required = false) Integer priceMinCents,
            @RequestParam(required = false) Integer priceMaxCents,
            @RequestParam(required = false) Integer durationMinMonths,
            @RequestParam(required = false) Integer durationMaxMonths,
            @RequestParam(defaultValue = "recent") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.search(distrito, concelho, freguesia, qualifications, availableOn,
                priceMinCents, priceMaxCents, durationMinMonths, durationMaxMonths, sort, page, size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDto> findById(@PathVariable UUID id) {
        return postService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        UUID requesterId = (UUID) auth.getPrincipal();
        postService.delete(id, requesterId);
        return ResponseEntity.noContent().build();
    }
}

package com.eldercare.eldercare.service;

import com.eldercare.eldercare.dto.CreatePostRequest;
import com.eldercare.eldercare.dto.PostDto;
import com.eldercare.eldercare.exception.PostNotFoundException;
import com.eldercare.eldercare.model.*;
import com.eldercare.eldercare.repository.PostRepository;
import com.eldercare.eldercare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostMapper postMapper;

    @Transactional
    public PostDto create(UUID authorId, CreatePostRequest req) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        Post post = new Post();
        post.setAuthor(author);
        post.setKind(req.kind());
        post.setDescription(req.description());
        post.setLocation(req.location());
        post.setPriceRange(req.priceRange());
        post.setDuration(req.duration());

        if (req.kind() == PostKind.CAREGIVER) {
            post.setEarliestStartDate(req.earliestStartDate());
            post.setOfferedQualifications(req.offeredQualifications() != null ? req.offeredQualifications() : List.of());
            if (req.availabilitySlots() != null) {
                List<AvailabilitySlot> slots = req.availabilitySlots().stream().map(s -> {
                    AvailabilitySlot slot = new AvailabilitySlot();
                    slot.setPost(post);
                    slot.setDay(s.day());
                    slot.setStartTime(s.startTime());
                    slot.setEndTime(s.endTime());
                    return slot;
                }).toList();
                post.setAvailabilitySlots(slots);
            }
        } else {
            post.setStartDate(req.startDate());
            post.setEndDate(req.endDate());
            post.setDailyStartTime(req.dailyStartTime());
            post.setDailyEndTime(req.dailyEndTime());
            post.setRequiredQualifications(req.requiredQualifications() != null ? req.requiredQualifications() : List.of());
        }

        return postMapper.toDto(postRepository.save(post));
    }

    @Transactional(readOnly = true)
    public List<PostDto> findAll() {
        return postRepository.findAll().stream().map(postMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<PostDto> findById(UUID id) {
        return postRepository.findById(id).map(postMapper::toDto);
    }

    @Transactional
    public void delete(UUID postId, UUID requesterId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));
        if (!post.getAuthor().getId().equals(requesterId)) {
            throw new AccessDeniedException("Not the author of this post");
        }
        postRepository.delete(post);
    }
}

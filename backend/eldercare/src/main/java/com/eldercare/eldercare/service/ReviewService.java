package com.eldercare.eldercare.service;

import com.eldercare.eldercare.dto.CreateReviewRequest;
import com.eldercare.eldercare.dto.ReviewDto;
import com.eldercare.eldercare.exception.ReviewAlreadyExistsException;
import com.eldercare.eldercare.model.Review;
import com.eldercare.eldercare.repository.ReviewRepository;
import com.eldercare.eldercare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewDto create(UUID reviewerId, UUID reviewedId, CreateReviewRequest req) {
        if (reviewerId.equals(reviewedId)) {
            throw new IllegalArgumentException("Cannot review yourself");
        }
        if (reviewRepository.findByReviewerIdAndReviewedId(reviewerId, reviewedId).isPresent()) {
            throw new ReviewAlreadyExistsException();
        }
        Review review = new Review();
        review.setReviewer(userRepository.getReferenceById(reviewerId));
        review.setReviewed(userRepository.getReferenceById(reviewedId));
        review.setRating(req.rating());
        review.setText(req.text());
        return toDto(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> findByUser(UUID reviewedId) {
        return reviewRepository.findByReviewedIdOrderByCreatedAtDesc(reviewedId).stream()
                .map(this::toDto)
                .toList();
    }

    private ReviewDto toDto(Review r) {
        return new ReviewDto(r.getId(), r.getReviewer().getId(), r.getReviewed().getId(), r.getRating(), r.getText(), r.getCreatedAt());
    }
}

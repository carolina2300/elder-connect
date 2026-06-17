package com.eldercare.eldercare.repository;

import com.eldercare.eldercare.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByReviewedIdOrderByCreatedAtDesc(UUID reviewedId);

    Optional<Review> findByReviewerIdAndReviewedId(UUID reviewerId, UUID reviewedId);
}

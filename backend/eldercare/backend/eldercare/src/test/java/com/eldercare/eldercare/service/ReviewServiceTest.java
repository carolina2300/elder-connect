package com.eldercare.eldercare.service;

import com.eldercare.eldercare.dto.CreateReviewRequest;
import com.eldercare.eldercare.dto.ReviewDto;
import com.eldercare.eldercare.exception.ReviewAlreadyExistsException;
import com.eldercare.eldercare.model.Review;
import com.eldercare.eldercare.model.User;
import com.eldercare.eldercare.repository.ReviewRepository;
import com.eldercare.eldercare.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    ReviewRepository reviewRepository;

    @Mock
    UserRepository userRepository;

    @InjectMocks
    ReviewService victim;

    private User userWithId(UUID id) {
        return User.builder().id(id).build();
    }

    @Test
    public void create_whenReviewingYourself_throws() {
        UUID id = UUID.randomUUID();
        CreateReviewRequest req = new CreateReviewRequest((short) 5, "great");

        assertThrows(IllegalArgumentException.class, () -> victim.create(id, id, req));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    public void create_whenReviewAlreadyExists_throws() {
        UUID reviewerId = UUID.randomUUID();
        UUID reviewedId = UUID.randomUUID();
        CreateReviewRequest req = new CreateReviewRequest((short) 4, "ok");
        when(reviewRepository.findByReviewerIdAndReviewedId(reviewerId, reviewedId))
                .thenReturn(Optional.of(new Review()));

        assertThrows(ReviewAlreadyExistsException.class, () -> victim.create(reviewerId, reviewedId, req));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    public void create_savesAndReturnsDto() {
        UUID reviewerId = UUID.randomUUID();
        UUID reviewedId = UUID.randomUUID();
        UUID reviewId = UUID.randomUUID();
        CreateReviewRequest req = new CreateReviewRequest((short) 5, "excellent");

        when(reviewRepository.findByReviewerIdAndReviewedId(reviewerId, reviewedId))
                .thenReturn(Optional.empty());
        when(userRepository.getReferenceById(reviewerId)).thenReturn(userWithId(reviewerId));
        when(userRepository.getReferenceById(reviewedId)).thenReturn(userWithId(reviewedId));
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> {
            Review r = invocation.getArgument(0);
            r.setId(reviewId);
            return r;
        });

        ReviewDto result = victim.create(reviewerId, reviewedId, req);

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(captor.capture());
        assertEquals((short) 5, captor.getValue().getRating());
        assertEquals("excellent", captor.getValue().getText());

        assertEquals(reviewId, result.id());
        assertEquals(reviewerId, result.reviewerId());
        assertEquals(reviewedId, result.reviewedId());
        assertEquals((short) 5, result.rating());
        assertEquals("excellent", result.text());
    }

    @Test
    public void findByUser_whenNoReviews_returnsEmptyList() {
        UUID reviewedId = UUID.randomUUID();
        when(reviewRepository.findByReviewedIdOrderByCreatedAtDesc(reviewedId)).thenReturn(List.of());

        List<ReviewDto> result = victim.findByUser(reviewedId);

        assertTrue(result.isEmpty());
    }

    @Test
    public void findByUser_returnsDtos() {
        UUID reviewerId = UUID.randomUUID();
        UUID reviewedId = UUID.randomUUID();
        Review review = new Review();
        review.setId(UUID.randomUUID());
        review.setReviewer(userWithId(reviewerId));
        review.setReviewed(userWithId(reviewedId));
        review.setRating((short) 3);
        review.setText("fine");
        when(reviewRepository.findByReviewedIdOrderByCreatedAtDesc(reviewedId)).thenReturn(List.of(review));

        List<ReviewDto> result = victim.findByUser(reviewedId);

        assertEquals(1, result.size());
        assertEquals(reviewerId, result.get(0).reviewerId());
        assertEquals(reviewedId, result.get(0).reviewedId());
        assertEquals((short) 3, result.get(0).rating());
        assertEquals("fine", result.get(0).text());
    }
}

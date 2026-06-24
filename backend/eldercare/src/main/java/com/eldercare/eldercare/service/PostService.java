package com.eldercare.eldercare.service;

import com.eldercare.eldercare.dto.CreatePostRequest;
import com.eldercare.eldercare.dto.PageResponse;
import com.eldercare.eldercare.dto.PostDto;
import com.eldercare.eldercare.exception.PostNotFoundException;
import com.eldercare.eldercare.model.*;
import com.eldercare.eldercare.repository.PostRepository;
import com.eldercare.eldercare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
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

    /**
     * Paginated + filtered post search. Filtering/sorting done in-memory
     * (dataset is small for this community platform). Page is zero-based.
     */
    @Transactional(readOnly = true)
    public PageResponse<PostDto> search(
            String distrito,
            String concelho,
            String freguesia,
            List<Qualification> qualifications,
            LocalDate availableOn,
            Integer priceMinCents,
            Integer priceMaxCents,
            Integer durationMinMonths,
            Integer durationMaxMonths,
            String sort,
            int page,
            int size) {

        int safeSize = size <= 0 ? 10 : size;
        int safePage = Math.max(page, 0);

        List<Post> filtered = postRepository.findAll().stream()
                .filter(p -> matchesLocation(p, distrito, concelho, freguesia))
                .filter(p -> matchesQualifications(p, qualifications))
                .filter(p -> matchesAvailableOn(p, availableOn))
                .filter(p -> matchesPrice(p, priceMinCents, priceMaxCents))
                .filter(p -> matchesDuration(p, durationMinMonths, durationMaxMonths))
                .sorted(comparatorFor(sort))
                .toList();

        int total = filtered.size();
        int totalPages = (int) Math.ceil((double) total / safeSize);
        int from = Math.min(safePage * safeSize, total);
        int to = Math.min(from + safeSize, total);

        List<PostDto> content = filtered.subList(from, to).stream()
                .map(postMapper::toDto)
                .toList();

        return new PageResponse<>(content, safePage, safeSize, total, totalPages);
    }

    private boolean matchesLocation(Post p, String distrito, String concelho, String freguesia) {
        GeoLocation loc = p.getLocation();
        if (loc == null) return distrito == null && concelho == null && freguesia == null;
        if (distrito != null && !distrito.equalsIgnoreCase(loc.getDistrito())) return false;
        if (concelho != null && !concelho.equalsIgnoreCase(loc.getConcelho())) return false;
        if (freguesia != null && !freguesia.equalsIgnoreCase(loc.getFreguesia())) return false;
        return true;
    }

    private boolean matchesQualifications(Post p, List<Qualification> wanted) {
        if (wanted == null || wanted.isEmpty()) return true;
        List<Qualification> postQuals = p.getKind() == PostKind.CAREGIVER
                ? p.getOfferedQualifications()
                : p.getRequiredQualifications();
        if (postQuals == null) return false;
        return wanted.stream().anyMatch(postQuals::contains);
    }

    private boolean matchesAvailableOn(Post p, LocalDate date) {
        if (date == null) return true;
        if (p.getKind() == PostKind.CAREGIVER) {
            LocalDate start = p.getEarliestStartDate();
            return start == null || !date.isBefore(start);
        }
        LocalDate start = p.getStartDate();
        LocalDate end = p.getEndDate();
        if (start != null && date.isBefore(start)) return false;
        if (end != null && date.isAfter(end)) return false;
        return true;
    }

    private boolean matchesPrice(Post p, Integer minCents, Integer maxCents) {
        PriceRange pr = p.getPriceRange();
        if (pr == null) return minCents == null && maxCents == null;
        // overlap test: post range [min,max] intersects requested [minCents,maxCents]
        if (minCents != null && pr.getMaxCents() < minCents) return false;
        if (maxCents != null && pr.getMinCents() > maxCents) return false;
        return true;
    }

    private boolean matchesDuration(Post p, Integer minMonths, Integer maxMonths) {
        if (minMonths == null && maxMonths == null) return true;
        PostDuration d = p.getDuration();
        if (d == null) return false;
        int months = d.getUnit() == DurationUnit.MONTH
                ? d.getAmount()
                : (int) Math.round(d.getAmount() / 4.0); // WEEK -> ~months
        if (minMonths != null && months < minMonths) return false;
        if (maxMonths != null && months > maxMonths) return false;
        return true;
    }

    private Comparator<Post> comparatorFor(String sort) {
        if (sort == null) sort = "recent";
        return switch (sort) {
            case "price_asc" -> Comparator.comparingInt(p ->
                    p.getPriceRange() == null ? Integer.MAX_VALUE : p.getPriceRange().getMinCents());
            case "price_desc" -> Comparator.comparingInt((Post p) ->
                    p.getPriceRange() == null ? Integer.MIN_VALUE : p.getPriceRange().getMinCents()).reversed();
            default -> Comparator.comparing(Post::getCreatedAt).reversed(); // recent
        };
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

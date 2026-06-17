package com.eldercare.eldercare.service;

import com.eldercare.eldercare.dto.PostDto;
import com.eldercare.eldercare.model.AvailabilitySlot;
import com.eldercare.eldercare.model.Post;
import com.eldercare.eldercare.model.WeekDay;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class PostMapper {

    public PostDto toDto(Post post) {
        Map<WeekDay, List<PostDto.TimeSlotDto>> weeklyAvailability = post.getAvailabilitySlots()
                .stream()
                .collect(Collectors.groupingBy(
                        AvailabilitySlot::getDay,
                        Collectors.mapping(
                                s -> new PostDto.TimeSlotDto(s.getStartTime(), s.getEndTime()),
                                Collectors.toList()
                        )
                ));

        return new PostDto(
                post.getId(),
                post.getAuthor().getId(),
                post.getKind(),
                post.getStatus(),
                post.getCreatedAt(),
                post.getDescription(),
                post.getLocation(),
                post.getPriceRange(),
                post.getDuration(),
                post.getEarliestStartDate(),
                post.getOfferedQualifications(),
                weeklyAvailability,
                post.getStartDate(),
                post.getEndDate(),
                post.getDailyStartTime(),
                post.getDailyEndTime(),
                post.getRequiredQualifications()
        );
    }
}

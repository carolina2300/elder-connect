package com.eldercare.eldercare.service;

import com.eldercare.eldercare.dto.PostDto;
import com.eldercare.eldercare.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class PostMapperTest {

    private PostMapper postMapper;

    @BeforeEach
    void setup(){
        postMapper = new PostMapper();
    }

    @Test
    void shouldMapPostToDto() {
        Post post = Post.builder()
                .id(UUID.randomUUID())
                .description("description")
                .author(User.builder().id(UUID.randomUUID()).build())
                .kind(PostKind.CARETAKER)
                .status(PostStatus.OPEN)
                .createdAt(Instant.now())
                .availabilitySlots(new ArrayList<>())
                .offeredQualifications(new ArrayList<>())
                .requiredQualifications(new ArrayList<>())
                .build();

        PostDto victim = postMapper.toDto(post);

        assertNotNull(victim);
        assertEquals(post.getId(), victim.id());
        assertEquals(post.getAuthor().getId(), victim.authorId());
        assertEquals(post.getKind(), victim.kind());
        assertEquals(post.getStatus(), victim.status());
        assertEquals(post.getDescription(), victim.description());
    }

    @Test
    void shouldMapAvailabilitySlotsToWeeklyAvailability(){
        AvailabilitySlot mondaySlot1 = AvailabilitySlot.builder()
                .day(WeekDay.MON)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(17, 0))
                .build();

        AvailabilitySlot mondaySlot2 = AvailabilitySlot.builder()
                .day(WeekDay.MON)
                .startTime(LocalTime.of(18, 0))
                .endTime(LocalTime.of(20, 0))
                .build();

        AvailabilitySlot tuesdaySlot1 = AvailabilitySlot.builder()
                .day(WeekDay.TUE)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(15, 0))
                .build();

        Post post = Post.builder()
                .id(UUID.randomUUID())
                .description("description 2")
                .author(User.builder().id(UUID.randomUUID()).build())
                .kind(PostKind.CARETAKER)
                .status(PostStatus.OPEN)
                .createdAt(Instant.now())
                .availabilitySlots(List.of(mondaySlot1, mondaySlot1, tuesdaySlot1))
                .offeredQualifications(new ArrayList<>())
                .requiredQualifications(new ArrayList<>())
                .build();

        PostDto victim = postMapper.toDto(post);

        assertEquals(2, victim.weeklyAvailability().get(WeekDay.MON).size());
        assertEquals(1, victim.weeklyAvailability().get(WeekDay.TUE).size());

    }

    @Test
    void emptyWeeklySLots(){
        Post post = Post.builder()
                .id(UUID.randomUUID())
                .description("description 2")
                .author(User.builder().id(UUID.randomUUID()).build())
                .kind(PostKind.CARETAKER)
                .status(PostStatus.OPEN)
                .createdAt(Instant.now())
                .availabilitySlots(new ArrayList<>())
                .offeredQualifications(new ArrayList<>())
                .requiredQualifications(new ArrayList<>())
                .build();

        PostDto victim = postMapper.toDto(post);

        assertNotNull(victim);
        assertTrue(victim.weeklyAvailability().isEmpty());
    }


}
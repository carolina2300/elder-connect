package com.eldercare.eldercare.dto;

import com.eldercare.eldercare.model.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record PostDto(
        UUID id,
        UUID authorId,
        PostKind kind,
        PostStatus status,
        Instant createdAt,
        String description,
        GeoLocation location,
        PriceRange priceRange,
        PostDuration duration,

        // CAREGIVER
        LocalDate earliestStartDate,
        List<Qualification> offeredQualifications,
        Map<WeekDay, List<TimeSlotDto>> weeklyAvailability,

        // CARETAKER
        LocalDate startDate,
        LocalDate endDate,
        LocalTime dailyStartTime,
        LocalTime dailyEndTime,
        List<Qualification> requiredQualifications
) {
    public record TimeSlotDto(LocalTime startTime, LocalTime endTime) {}
}

package com.eldercare.eldercare.dto;

import com.eldercare.eldercare.model.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record CreatePostRequest(
        @NotNull PostKind kind,
        String description,
        @NotNull GeoLocation location,
        @NotNull PriceRange priceRange,
        @NotNull PostDuration duration,

        // CAREGIVER
        LocalDate earliestStartDate,
        List<Qualification> offeredQualifications,
        List<AvailabilitySlotRequest> availabilitySlots,

        // CARETAKER
        LocalDate startDate,
        LocalDate endDate,
        LocalTime dailyStartTime,
        LocalTime dailyEndTime,
        List<Qualification> requiredQualifications
) {
    public record AvailabilitySlotRequest(
            @NotNull WeekDay day,
            @NotNull LocalTime startTime,
            @NotNull LocalTime endTime
    ) {}
}

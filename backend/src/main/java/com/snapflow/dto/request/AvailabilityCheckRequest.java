package com.snapflow.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AvailabilityCheckRequest {
    @NotNull(message = "Date is required")
    private LocalDate eventDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @Min(value = 1, message = "Duration must be at least 1 hour")
    @Max(value = 24, message = "Duration cannot exceed 24 hours")
    private Integer durationHours = 4;

    private Long preferredPhotographerId;
}

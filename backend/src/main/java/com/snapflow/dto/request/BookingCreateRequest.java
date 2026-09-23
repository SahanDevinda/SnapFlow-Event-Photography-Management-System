package com.snapflow.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class BookingCreateRequest {
    private Long customerId; // Optional: set by CRO if booking on behalf of customer

    @NotNull(message = "Package is required")
    private Long packageId;

    private Long preferredPhotographerId;

    @NotNull(message = "Event date is required")
    @FutureOrPresent(message = "Event date cannot be in the past")
    private LocalDate eventDate;

    @NotNull(message = "Event start time is required")
    private LocalTime startTime;

    @NotBlank(message = "Venue is required")
    @Size(max = 255, message = "Venue cannot exceed 255 characters")
    private String venue;

    @NotBlank(message = "Event type is required")
    @Size(max = 50, message = "Event type cannot exceed 50 characters")
    private String eventType;

    @Size(max = 2000, message = "Special requests cannot exceed 2000 characters")
    private String specialRequests;

    @Size(max = 20, message = "A booking cannot have more than 20 add-ons")
    private List<Long> addOnIds;
}

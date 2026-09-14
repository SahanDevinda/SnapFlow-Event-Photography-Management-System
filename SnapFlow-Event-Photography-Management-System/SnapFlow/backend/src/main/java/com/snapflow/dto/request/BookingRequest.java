package com.snapflow.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class BookingRequest {

    @NotNull(message = "Package ID is required")
    private Long packageId;

    @NotNull(message = "Event date is required")
    @FutureOrPresent(message = "Event date must be today or in the future")
    private LocalDate eventDate;

    private LocalTime eventTime;

    private String venue;

    private String eventType;

    private String specialRequests;

    private List<Long> addOnIds;

    // Optional: preferred photographer (PBI-05)
    private Long preferredPhotographerId;

    // For CRO creating booking on behalf of customer (PBI-22)
    private Long customerId;
}

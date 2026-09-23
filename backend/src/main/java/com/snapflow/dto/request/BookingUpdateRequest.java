package com.snapflow.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Partial-update payload for PUT /bookings/{id}. Every field is optional
 * (only fields actually provided are validated and applied), but any field
 * that IS provided must still satisfy these constraints.
 */
@Data
public class BookingUpdateRequest {
    private Long packageId;
    private Long preferredPhotographerId;

    @FutureOrPresent(message = "Event date cannot be in the past")
    private LocalDate eventDate;

    private LocalTime startTime;

    @Size(max = 255, message = "Venue cannot exceed 255 characters")
    private String venue;

    @Size(max = 50, message = "Event type cannot exceed 50 characters")
    private String eventType;

    @Size(max = 2000, message = "Special requests cannot exceed 2000 characters")
    private String specialRequests;

    @Size(max = 2000, message = "Internal notes cannot exceed 2000 characters")
    private String internalNotes;

    @Size(max = 20, message = "A booking cannot have more than 20 add-ons")
    private List<Long> addOnIds;
}

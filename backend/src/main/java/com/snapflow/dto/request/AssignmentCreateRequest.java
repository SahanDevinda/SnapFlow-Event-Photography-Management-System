package com.snapflow.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AssignmentCreateRequest {
    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Photographer ID is required")
    private Long photographerId;

    @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
    private String notes;
}

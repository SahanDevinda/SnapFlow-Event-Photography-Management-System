package com.snapflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GalleryCreateRequest {
    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotBlank(message = "Gallery title is required")
    @Size(max = 150, message = "Gallery title cannot exceed 150 characters")
    private String title;

    private boolean proofSelectionEnabled;

    private LocalDate proofDeadline;
}

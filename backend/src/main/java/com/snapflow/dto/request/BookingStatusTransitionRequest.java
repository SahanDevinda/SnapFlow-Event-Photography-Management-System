package com.snapflow.dto.request;

import com.snapflow.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BookingStatusTransitionRequest {
    @NotNull(message = "New status is required")
    private BookingStatus newStatus;

    @Size(max = 255, message = "Remarks cannot exceed 255 characters")
    private String remarks;
}

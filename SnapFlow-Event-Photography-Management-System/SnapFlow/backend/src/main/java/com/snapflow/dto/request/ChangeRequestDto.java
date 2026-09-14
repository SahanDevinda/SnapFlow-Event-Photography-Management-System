package com.snapflow.dto.request;

import com.snapflow.enums.ChangeRequestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeRequestDto {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Request type is required")
    private ChangeRequestType requestType;

    @NotBlank(message = "Description is required")
    private String description;
}

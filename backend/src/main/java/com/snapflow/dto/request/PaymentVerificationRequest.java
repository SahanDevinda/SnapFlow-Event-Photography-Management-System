package com.snapflow.dto.request;

import com.snapflow.enums.PaymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentVerificationRequest {
    @NotNull(message = "Status (VERIFIED or REJECTED) is required")
    private PaymentStatus status;

    @NotBlank(message = "Verification notes are mandatory")
    @Size(max = 2000, message = "Verification notes cannot exceed 2000 characters")
    private String verificationNotes;
}

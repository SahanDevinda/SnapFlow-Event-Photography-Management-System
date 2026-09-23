package com.snapflow.dto.request;

import com.snapflow.enums.PaymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentCreateRequest {
    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotBlank(message = "Transaction reference is required")
    @Size(max = 100, message = "Transaction reference cannot exceed 100 characters")
    private String transactionReference;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Payment amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Payment type is required")
    private PaymentType paymentType;
}

package com.snapflow.dto.response;

import com.snapflow.enums.PaymentStatus;
import com.snapflow.enums.PaymentType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private String bookingRef;
    private BigDecimal amount;
    private PaymentType paymentType;
    private String paymentMethod;
    private PaymentStatus status;
    private String receiptPath;
    private Long verifiedById;
    private String verifiedByName;
    private LocalDateTime verifiedAt;
    private String notes;
    private LocalDateTime createdAt;
}

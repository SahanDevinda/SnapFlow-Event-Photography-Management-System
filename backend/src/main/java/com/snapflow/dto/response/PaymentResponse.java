package com.snapflow.dto.response;

import com.snapflow.enums.PaymentStatus;
import com.snapflow.enums.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private String bookingRef;
    private String customerName;
    private String transactionReference;
    private BigDecimal amount;
    private PaymentType paymentType;
    private LocalDateTime paymentDate;
    private String receiptOriginalName;
    private PaymentStatus status;
    private Long verifiedById;
    private String verifiedByName;
    private String verificationNotes;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;
}

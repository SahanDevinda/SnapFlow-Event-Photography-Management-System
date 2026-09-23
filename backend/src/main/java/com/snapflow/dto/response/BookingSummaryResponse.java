package com.snapflow.dto.response;

import com.snapflow.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSummaryResponse {
    private Long id;
    private String bookingRef;
    private String customerName;
    private String customerEmail;
    private String packageName;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String venue;
    private String eventType;
    private BookingStatus status;
    private BigDecimal totalAmount;
    private BigDecimal balanceAmount;
}

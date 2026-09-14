package com.snapflow.dto.response;

import com.snapflow.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private String bookingRef;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long packageId;
    private String packageName;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String venue;
    private String eventType;
    private String specialRequests;
    private BookingStatus status;
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;
    private BigDecimal balanceAmount;
    private BigDecimal additionalCharges;
    private String notes;
    private List<String> addOnNames;
    private List<AssignmentSummary> assignments;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class AssignmentSummary {
        private Long assignmentId;
        private Long photographerId;
        private String photographerName;
        private String status;
        private Boolean attendanceConfirmed;
    }
}

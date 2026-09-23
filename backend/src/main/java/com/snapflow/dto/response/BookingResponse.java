package com.snapflow.dto.response;

import com.snapflow.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingRef;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Long packageId;
    private String packageName;
    private Integer durationHours;
    private Long preferredPhotographerId;
    private String preferredPhotographerName;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String venue;
    private String eventType;
    private String specialRequests;
    private BookingStatus status;
    private BigDecimal packagePrice;
    private BigDecimal addOnsPrice;
    private BigDecimal additionalCharges;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private String internalNotes;
    private List<AddOnResponse> addOns;
    private List<AssignmentResponse> assignments;
    private Long galleryId;
    private String galleryAccessCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

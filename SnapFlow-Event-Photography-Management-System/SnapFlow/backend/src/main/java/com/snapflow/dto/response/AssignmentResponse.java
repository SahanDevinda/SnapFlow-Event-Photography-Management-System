package com.snapflow.dto.response;

import com.snapflow.enums.AssignmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class AssignmentResponse {
    private Long id;
    private Long bookingId;
    private String bookingRef;
    private Long photographerId;
    private String photographerName;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String venue;
    private String eventType;
    private String packageName;
    private String customerName;
    private AssignmentStatus status;
    private Boolean attendanceConfirmed;
    private String notes;
    private LocalDateTime assignedAt;
}

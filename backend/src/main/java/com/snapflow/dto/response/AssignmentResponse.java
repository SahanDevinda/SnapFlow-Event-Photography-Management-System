package com.snapflow.dto.response;

import com.snapflow.enums.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {
    private Long id;
    private Long bookingId;
    private String bookingRef;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String venue;
    private String packageName;
    private Long photographerId;
    private String photographerName;
    private String photographerEmail;
    private String photographerPhone;
    private AssignmentStatus status;
    private Long assignedById;
    private String assignedByName;
    private String notes;
    private LocalDateTime createdAt;
}

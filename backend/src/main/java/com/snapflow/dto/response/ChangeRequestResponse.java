package com.snapflow.dto.response;

import com.snapflow.enums.ChangeRequestStatus;
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
public class ChangeRequestResponse {
    private Long id;
    private Long bookingId;
    private String bookingRef;
    private Long proposedPackageId;
    private String proposedPackageName;
    private LocalDate proposedDate;
    private LocalTime proposedStartTime;
    private LocalTime proposedEndTime;
    private String proposedVenue;
    private String description;
    private BigDecimal priceDifference;
    private ChangeRequestStatus status;
    private Long reviewedById;
    private String reviewedByName;
    private String reviewNotes;
    private LocalDateTime reviewedAt;
    private List<AddOnResponse> requestedAddOns;
    private LocalDateTime createdAt;
}

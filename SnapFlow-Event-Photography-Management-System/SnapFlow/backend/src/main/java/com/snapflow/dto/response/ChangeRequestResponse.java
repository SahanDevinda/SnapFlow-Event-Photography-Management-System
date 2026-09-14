package com.snapflow.dto.response;

import com.snapflow.enums.ChangeRequestStatus;
import com.snapflow.enums.ChangeRequestType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChangeRequestResponse {
    private Long id;
    private Long bookingId;
    private String bookingRef;
    private Long requestedById;
    private String requestedByName;
    private ChangeRequestType requestType;
    private String description;
    private ChangeRequestStatus status;
    private Long reviewedById;
    private String reviewedByName;
    private String reviewNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.snapflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentAllocationResponse {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentSerialNumber;
    private Long bookingId;
    private String bookingRef;
    private Long photographerId;
    private String photographerName;
    private Long allocatedById;
    private String allocatedByName;
    private LocalDateTime allocatedAt;
    private LocalDateTime returnedAt;
    private String notes;
}

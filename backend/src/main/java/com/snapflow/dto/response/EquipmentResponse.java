package com.snapflow.dto.response;

import com.snapflow.enums.EquipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentResponse {
    private Long id;
    private String name;
    private String category;
    private String serialNumber;
    private EquipmentStatus status;
    private String notes;
    private LocalDateTime createdAt;
}

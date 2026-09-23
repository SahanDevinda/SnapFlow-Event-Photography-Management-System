package com.snapflow.dto.request;

import com.snapflow.enums.EquipmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EquipmentRequest {
    @NotBlank(message = "Equipment name is required")
    @Size(max = 100, message = "Equipment name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category;

    @NotBlank(message = "Serial number is required")
    @Size(max = 100, message = "Serial number cannot exceed 100 characters")
    private String serialNumber;

    private EquipmentStatus status = EquipmentStatus.AVAILABLE;

    @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
    private String notes;
}

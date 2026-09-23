package com.snapflow.dto.request;

import com.snapflow.enums.AssignmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AssignmentStatusUpdateRequest {
    @NotNull(message = "New status is required")
    private AssignmentStatus newStatus;

    @Size(max = 255, message = "Remarks cannot exceed 255 characters")
    private String remarks;
}

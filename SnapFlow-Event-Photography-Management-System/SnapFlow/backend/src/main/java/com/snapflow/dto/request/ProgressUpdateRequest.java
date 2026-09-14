package com.snapflow.dto.request;

import com.snapflow.enums.AssignmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProgressUpdateRequest {

    @NotNull(message = "Status is required")
    private AssignmentStatus status;

    private Boolean attendanceConfirmed;

    private String notes;
}

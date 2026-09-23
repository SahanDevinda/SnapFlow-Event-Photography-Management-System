package com.snapflow.dto.request;

import com.snapflow.enums.ChangeRequestStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangeRequestReviewDto {
    @NotNull(message = "Status (APPROVED or REJECTED) is required")
    private ChangeRequestStatus status;

    @Size(max = 2000, message = "Review notes cannot exceed 2000 characters")
    private String reviewNotes;
}

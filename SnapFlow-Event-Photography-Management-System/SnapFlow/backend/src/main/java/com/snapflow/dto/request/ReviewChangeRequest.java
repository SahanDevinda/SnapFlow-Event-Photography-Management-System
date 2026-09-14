package com.snapflow.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewChangeRequest {

    @NotNull(message = "Approved flag is required")
    private Boolean approved;

    private String reviewNotes;
}

package com.snapflow.dto.request;

import com.snapflow.enums.FeedbackStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeedbackResponseRequest {
    @NotBlank(message = "Response message is required")
    @Size(max = 4000, message = "Response cannot exceed 4000 characters")
    private String response;

    @NotNull(message = "Feedback status is required")
    private FeedbackStatus status;
}

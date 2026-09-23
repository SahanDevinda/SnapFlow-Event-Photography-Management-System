package com.snapflow.dto.response;

import com.snapflow.enums.FeedbackStatus;
import com.snapflow.enums.FeedbackType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;
    private Long customerId;
    private String name;
    private String email;
    private FeedbackType type;
    private String subject;
    private String message;
    private FeedbackStatus status;
    private String response;
    private Long respondedById;
    private String respondedByName;
    private LocalDateTime respondedAt;
    private LocalDateTime createdAt;
}

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
public class ReviewResponse {
    private Long id;
    private Long bookingId;
    private String bookingRef;
    private Long customerId;
    private String customerName;
    private Integer rating;
    private String comment;
    private Long photographerId;
    private String photographerName;
    private LocalDateTime createdAt;
}

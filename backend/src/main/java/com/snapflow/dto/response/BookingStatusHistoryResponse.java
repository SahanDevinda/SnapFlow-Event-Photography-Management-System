package com.snapflow.dto.response;

import com.snapflow.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusHistoryResponse {
    private Long id;
    private Long bookingId;
    private BookingStatus fromStatus;
    private BookingStatus toStatus;
    private String remarks;
    private Long changedById;
    private String changedByName;
    private LocalDateTime createdAt;
}

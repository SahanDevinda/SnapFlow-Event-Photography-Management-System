package com.snapflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityCheckResponse {
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean generalAvailable;
    private Boolean preferredPhotographerAvailable;
    private List<UserResponse> availablePhotographers;
    private String message;
}

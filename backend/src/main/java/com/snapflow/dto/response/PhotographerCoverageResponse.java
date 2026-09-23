package com.snapflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotographerCoverageResponse {
    private Long photographerId;
    private String photographerName;
    private int totalCompletedEvents;
    private Double averageRating;
    private List<AssignmentResponse> recentCompletedAssignments;
    private List<ReviewResponse> recentReviews;
}

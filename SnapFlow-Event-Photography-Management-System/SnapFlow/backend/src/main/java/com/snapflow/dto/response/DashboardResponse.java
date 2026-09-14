package com.snapflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardResponse {
    private long totalBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long completedEvents;
    private long upcomingEvents;
    private BigDecimal totalRevenue;
    private BigDecimal outstandingPayments;
    private long activePhotographers;
    private List<BookingResponse> recentBookings;
    private Map<String, Long> bookingsByStatus;
    private Map<String, BigDecimal> monthlyRevenue;
}

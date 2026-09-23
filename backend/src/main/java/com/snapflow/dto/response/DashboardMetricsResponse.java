package com.snapflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsResponse {
    private BigDecimal totalSales;
    private BigDecimal verifiedRevenue;
    private BigDecimal outstandingBalance;
    private long totalCustomers;
    private long totalPhotographers;
    private long activePackagesCount;
    private long totalBookings;
    private Map<String, Long> bookingStatusCounts;
    private Map<String, BigDecimal> monthlyRevenue;
    private Map<String, Long> photographerWorkload;
}

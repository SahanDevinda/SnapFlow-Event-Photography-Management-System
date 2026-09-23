package com.snapflow.controller;

import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.DashboardMetricsResponse;
import com.snapflow.dto.response.PhotographerCoverageResponse;
import com.snapflow.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboards")
@RequiredArgsConstructor
@Tag(name = "Dashboards", description = "Executive metrics and photographer coverage statistics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/executive")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Get executive dashboard metrics")
    public ResponseEntity<ApiResponse<DashboardMetricsResponse>> getExecutiveMetrics() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getExecutiveMetrics()));
    }

    @GetMapping("/coverage/{photographerId}")
    @PreAuthorize("hasAnyRole('PHOTOGRAPHER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Get monthly photographer coverage metrics and ratings")
    public ResponseEntity<ApiResponse<PhotographerCoverageResponse>> getPhotographerCoverage(@PathVariable Long photographerId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getPhotographerCoverageSummary(photographerId)));
    }
}

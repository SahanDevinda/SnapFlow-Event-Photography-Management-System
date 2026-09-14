package com.snapflow.controller;

import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.DashboardResponse;
import com.snapflow.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('COMPANY_DIRECTOR', 'OPERATIONS_MANAGER', 'FINANCE_EXECUTIVE')")
    public ResponseEntity<ApiResponse<DashboardResponse>> summary() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getExecutiveSummary()));
    }
}

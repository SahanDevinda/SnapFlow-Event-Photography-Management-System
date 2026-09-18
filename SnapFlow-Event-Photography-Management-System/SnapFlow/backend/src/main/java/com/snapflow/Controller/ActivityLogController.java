package com.snapflow.controller;

import com.snapflow.dto.response.ApiResponse;
import com.snapflow.entity.ActivityLog;
import com.snapflow.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<List<ActivityLog>>> getRecentLogs() {
        return ResponseEntity.ok(ApiResponse.ok(activityLogService.getRecentLogs()));
    }
}

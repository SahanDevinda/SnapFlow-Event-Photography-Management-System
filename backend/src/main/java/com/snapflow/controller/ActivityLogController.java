package com.snapflow.controller;

import com.snapflow.dto.response.ActivityLogResponse;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/activity-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Activity audit trail for compliance")
public class ActivityLogController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Get paginated activity logs")
    public ResponseEntity<ApiResponse<Page<ActivityLogResponse>>> getActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getAllLogs(PageRequest.of(page, size))));
    }
}

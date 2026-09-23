package com.snapflow.controller;

import com.snapflow.dto.request.AssignmentCreateRequest;
import com.snapflow.dto.request.AssignmentStatusUpdateRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.AssignmentResponse;
import com.snapflow.dto.response.AssignmentStatusHistoryResponse;
import com.snapflow.service.AssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignments")
@RequiredArgsConstructor
@Tag(name = "Assignments", description = "Photographer event assignments and workflow")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Assign photographer to booking with conflict detection")
    public ResponseEntity<ApiResponse<AssignmentResponse>> assignPhotographer(@Valid @RequestBody AssignmentCreateRequest request) {
        AssignmentResponse response = assignmentService.assignPhotographer(request);
        return new ResponseEntity<>(ApiResponse.success("Photographer assigned", response), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PHOTOGRAPHER')")
    @Operation(summary = "Get assignments for the authenticated photographer")
    public ResponseEntity<ApiResponse<Page<AssignmentResponse>>> getMyAssignments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getMyAssignments(PageRequest.of(page, size, Sort.by("booking.eventDate").descending()))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get assignment details by ID")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getAssignmentById(id)));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get assignments for a booking")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getBookingAssignments(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getBookingAssignments(bookingId)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update assignment workflow status (ASSIGNED -> CONFIRMED -> IN_PROGRESS -> COMPLETED)")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateStatus(@PathVariable Long id, @Valid @RequestBody AssignmentStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Assignment status updated", assignmentService.updateAssignmentStatus(id, request)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Cancel an assignment")
    public ResponseEntity<ApiResponse<Void>> cancelAssignment(@PathVariable Long id, @RequestParam(required = false) String reason) {
        assignmentService.cancelAssignment(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Assignment cancelled", null));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get status change history of an assignment")
    public ResponseEntity<ApiResponse<List<AssignmentStatusHistoryResponse>>> getAssignmentHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getAssignmentHistory(id)));
    }
}

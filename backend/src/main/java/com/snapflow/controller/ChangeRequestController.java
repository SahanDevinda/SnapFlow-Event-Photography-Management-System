package com.snapflow.controller;

import com.snapflow.dto.request.ChangeRequestCreateDto;
import com.snapflow.dto.request.ChangeRequestReviewDto;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.ChangeRequestResponse;
import com.snapflow.enums.ChangeRequestStatus;
import com.snapflow.service.ChangeRequestService;
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
@RequestMapping("/change-requests")
@RequiredArgsConstructor
@Tag(name = "Change Requests", description = "Customer booking modification request workflows")
public class ChangeRequestController {

    private final ChangeRequestService changeRequestService;

    @PostMapping("/booking/{bookingId}")
    @Operation(summary = "Submit a change request for a booking")
    public ResponseEntity<ApiResponse<ChangeRequestResponse>> createChangeRequest(
            @PathVariable Long bookingId,
            @Valid @RequestBody ChangeRequestCreateDto dto
    ) {
        ChangeRequestResponse response = changeRequestService.createChangeRequest(bookingId, dto);
        return new ResponseEntity<>(ApiResponse.success("Change request submitted", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edit a pending change request")
    public ResponseEntity<ApiResponse<ChangeRequestResponse>> updatePendingChangeRequest(
            @PathVariable Long id,
            @Valid @RequestBody ChangeRequestCreateDto dto
    ) {
        return ResponseEntity.ok(ApiResponse.success("Change request updated", changeRequestService.updatePendingChangeRequest(id, dto)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a pending change request")
    public ResponseEntity<ApiResponse<Void>> deletePendingChangeRequest(@PathVariable Long id) {
        changeRequestService.deletePendingChangeRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Change request deleted", null));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Approve or reject a change request and transactionally update the booking")
    public ResponseEntity<ApiResponse<ChangeRequestResponse>> reviewChangeRequest(
            @PathVariable Long id,
            @Valid @RequestBody ChangeRequestReviewDto dto
    ) {
        return ResponseEntity.ok(ApiResponse.success("Change request reviewed", changeRequestService.reviewChangeRequest(id, dto)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get change requests submitted by the logged-in customer")
    public ResponseEntity<ApiResponse<List<ChangeRequestResponse>>> getMyChangeRequests() {
        return ResponseEntity.ok(ApiResponse.success(changeRequestService.getMyChangeRequests()));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get all change requests for a booking")
    public ResponseEntity<ApiResponse<List<ChangeRequestResponse>>> getBookingChangeRequests(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success(changeRequestService.getBookingChangeRequests(bookingId)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Get all pending change requests for staff review")
    public ResponseEntity<ApiResponse<Page<ChangeRequestResponse>>> getPendingRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(changeRequestService.getChangeRequestsByStatus(
                ChangeRequestStatus.PENDING, PageRequest.of(page, size, Sort.by("createdAt").ascending())
        )));
    }
}

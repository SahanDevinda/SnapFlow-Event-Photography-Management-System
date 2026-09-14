package com.snapflow.controller;

import com.snapflow.dto.request.ChangeRequestDto;
import com.snapflow.dto.request.ReviewChangeRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.ChangeRequestResponse;
import com.snapflow.service.ChangeRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/change-requests")
@RequiredArgsConstructor
public class ChangeRequestController {

    private final ChangeRequestService changeRequestService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CUSTOMER_RELATIONS_OFFICER')")
    public ResponseEntity<ApiResponse<ChangeRequestResponse>> create(
            @Valid @RequestBody ChangeRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Change request submitted", changeRequestService.create(dto)));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<ChangeRequestResponse>> review(
            @PathVariable Long id,
            @Valid @RequestBody ReviewChangeRequest review) {
        return ResponseEntity.ok(ApiResponse.ok("Change request reviewed",
                changeRequestService.review(id, review)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<List<ChangeRequestResponse>>> getPending() {
        return ResponseEntity.ok(ApiResponse.ok(changeRequestService.getPending()));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ChangeRequestResponse>>> myRequests() {
        return ResponseEntity.ok(ApiResponse.ok(changeRequestService.getMyRequests()));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<ChangeRequestResponse>>> byBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.ok(changeRequestService.getByBooking(bookingId)));
    }
}

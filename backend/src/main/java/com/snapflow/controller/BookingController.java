package com.snapflow.controller;

import com.snapflow.dto.request.AvailabilityCheckRequest;
import com.snapflow.dto.request.BookingCreateRequest;
import com.snapflow.dto.request.BookingStatusTransitionRequest;
import com.snapflow.dto.request.BookingUpdateRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.AvailabilityCheckResponse;
import com.snapflow.dto.response.BookingResponse;
import com.snapflow.dto.response.BookingStatusHistoryResponse;
import com.snapflow.dto.response.BookingSummaryResponse;
import com.snapflow.enums.BookingStatus;
import com.snapflow.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Event booking lifecycle management")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/check-availability")
    @Operation(summary = "Live availability check for date and time")
    public ResponseEntity<ApiResponse<AvailabilityCheckResponse>> checkAvailability(@Valid @RequestBody AvailabilityCheckRequest request) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.checkAvailability(request)));
    }

    @PostMapping
    @Operation(summary = "Create a booking (Customer or CRO)")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingCreateRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return new ResponseEntity<>(ApiResponse.success("Booking created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @Operation(summary = "Get bookings for the logged-in customer")
    public ResponseEntity<ApiResponse<Page<BookingSummaryResponse>>> getMyBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getMyBookings(PageRequest.of(page, size, Sort.by("eventDate").descending()))));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPANY_DIRECTOR', 'OPERATIONS_MANAGER', 'CUSTOMER_RELATIONS_OFFICER', 'FINANCE_EXECUTIVE')")
    @Operation(summary = "Filter and search all authorized bookings")
    public ResponseEntity<ApiResponse<Page<BookingSummaryResponse>>> filterBookings(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<BookingSummaryResponse> result = bookingService.filterBookings(
                customerId, status, startDate, endDate, search,
                PageRequest.of(page, size, Sort.by("eventDate").descending())
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full booking details by ID")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingById(id)));
    }

    @GetMapping("/ref/{bookingRef}")
    @Operation(summary = "Lookup booking by reference (e.g. SF-2026-0001)")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByRef(@PathVariable String bookingRef) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingByRef(bookingRef)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY_DIRECTOR', 'CUSTOMER_RELATIONS_OFFICER', 'OPERATIONS_MANAGER')")
    @Operation(summary = "Update booking details")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBooking(@PathVariable Long id, @Valid @RequestBody BookingUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Booking updated", bookingService.updateBooking(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('COMPANY_DIRECTOR', 'OPERATIONS_MANAGER', 'CUSTOMER_RELATIONS_OFFICER')")
    @Operation(summary = "Valid booking status transition")
    public ResponseEntity<ApiResponse<BookingResponse>> transitionStatus(@PathVariable Long id, @Valid @RequestBody BookingStatusTransitionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Status transitioned", bookingService.transitionBookingStatus(id, request)));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an eligible booking")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(@PathVariable Long id, @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", bookingService.cancelBooking(id, reason)));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get audit status history for a booking")
    public ResponseEntity<ApiResponse<List<BookingStatusHistoryResponse>>> getBookingHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingHistory(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Hard-delete a booking (Director only). Blocked if verified payments exist.")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok(ApiResponse.success("Booking deleted successfully", null));
    }
}

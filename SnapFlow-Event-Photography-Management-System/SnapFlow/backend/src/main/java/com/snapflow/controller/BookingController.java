package com.snapflow.controller;

import com.snapflow.dto.request.BookingRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.BookingResponse;
import com.snapflow.enums.BookingStatus;
import com.snapflow.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CUSTOMER_RELATIONS_OFFICER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<BookingResponse>> create(@Valid @RequestBody BookingRequest request) {
        BookingResponse created = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Booking created successfully", created));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> myBookings() {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getMyBookings()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR', 'FINANCE_EXECUTIVE')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getAllBookings()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getById(id)));
    }

    @GetMapping("/ref/{ref}")
    public ResponseEntity<ApiResponse<BookingResponse>> getByRef(@PathVariable String ref) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getByRef(ref)));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getByStatus(@PathVariable BookingStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getByStatus(status)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<BookingResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        BookingStatus status = BookingStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.ok("Status updated",
                bookingService.updateStatus(id, status)));
    }
}

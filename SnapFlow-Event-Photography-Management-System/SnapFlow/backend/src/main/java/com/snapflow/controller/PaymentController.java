package com.snapflow.controller;

import com.snapflow.dto.request.PaymentRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.PaymentResponse;
import com.snapflow.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'FINANCE_EXECUTIVE', 'CUSTOMER_RELATIONS_OFFICER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<PaymentResponse>> record(
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Payment recorded", paymentService.recordPayment(request)));
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('FINANCE_EXECUTIVE', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<PaymentResponse>> verify(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        boolean approved = Boolean.TRUE.equals(body.get("approved"));
        String notes = body.get("notes") != null ? body.get("notes").toString() : null;
        return ResponseEntity.ok(ApiResponse.ok(
                approved ? "Payment verified" : "Payment rejected",
                paymentService.verifyPayment(id, approved, notes)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('FINANCE_EXECUTIVE', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> pending() {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getPendingVerifications()));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> byBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getByBooking(bookingId)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FINANCE_EXECUTIVE', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getAll()));
    }
}

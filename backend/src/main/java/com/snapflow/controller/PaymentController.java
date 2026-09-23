package com.snapflow.controller;

import com.snapflow.dto.request.PaymentCreateRequest;
import com.snapflow.dto.request.PaymentVerificationRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.PaymentResponse;
import com.snapflow.enums.PaymentStatus;
import com.snapflow.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment recording, receipt management, and financial audit")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Submit a payment with real receipt file upload")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @Valid @ModelAttribute PaymentCreateRequest request,
            @RequestParam(value = "receipt", required = false) MultipartFile receiptFile
    ) {
        PaymentResponse response = paymentService.createPayment(request, receiptFile);
        return new ResponseEntity<>(ApiResponse.success("Payment recorded", response), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('FINANCE_EXECUTIVE', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Approve or reject a payment with mandatory notes")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentVerificationRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Payment verification processed", paymentService.verifyPayment(id, request)));
    }

    @GetMapping("/{id}/receipt")
    @Operation(summary = "Securely view/stream receipt file")
    public ResponseEntity<Resource> getReceipt(@PathVariable Long id) {
        Resource resource = paymentService.getReceiptResource(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FINANCE_EXECUTIVE', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Get single payment details by ID")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentById(id)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('FINANCE_EXECUTIVE', 'COMPANY_DIRECTOR')")
    @Operation(summary = "List pending payments awaiting verification")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getPendingPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPendingPayments(PageRequest.of(page, size, Sort.by("createdAt").ascending()))));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FINANCE_EXECUTIVE', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Filter payments by date, status, customer")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> filterPayments(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.filterPayments(
                status, startDate, endDate, PageRequest.of(page, size, Sort.by("paymentDate").descending())
        )));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get all payments for a booking")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getBookingPayments(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getBookingPayments(bookingId)));
    }

    @PostMapping("/reminders/trigger")
    @PreAuthorize("hasAnyRole('FINANCE_EXECUTIVE', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Manually trigger the 14-day balance reminder job")
    public ResponseEntity<ApiResponse<Void>> triggerBalanceReminders() {
        paymentService.triggerAutomatedBalanceReminders();
        return ResponseEntity.ok(ApiResponse.success("14-day balance reminders executed", null));
    }

    @PostMapping("/reminders/{bookingId}")
    @PreAuthorize("hasAnyRole('FINANCE_EXECUTIVE', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Send manual balance reminder notification to booking customer")
    public ResponseEntity<ApiResponse<Void>> sendBalanceReminder(@PathVariable Long bookingId) {
        paymentService.sendManualBalanceReminder(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Reminder sent", null));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('FINANCE_EXECUTIVE', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Export financial payments report as CSV")
    public ResponseEntity<byte[]> exportPaymentsCsv(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        byte[] csv = paymentService.exportPaymentsCsv(status, startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=snapflow_payments_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}

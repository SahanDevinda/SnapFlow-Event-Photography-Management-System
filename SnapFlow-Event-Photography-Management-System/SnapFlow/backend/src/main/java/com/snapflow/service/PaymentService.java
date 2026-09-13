package com.snapflow.service;

import com.snapflow.enums.PaymentStatus;
import com.snapflow.enums.PaymentType;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.PaymentRepository;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingService bookingService;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request) {
        Booking booking = bookingService.getEntityById(request.getBookingId());

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(request.getAmount())
                .paymentType(request.getPaymentType())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Bank Transfer")
                .status(PaymentStatus.PENDING)
                .notes(request.getNotes())
                .build();

        payment = paymentRepository.save(payment);

        notificationService.notify(booking.getCustomer().getId(), "Payment Recorded",
                "A payment of LKR " + request.getAmount() + " has been recorded for booking " + booking.getBookingRef() +
                        ". Awaiting verification.",
                "PAYMENT", "PAYMENT", payment.getId());

        activityLogService.log(securityUtils.getCurrentUserId(), "RECORD_PAYMENT", "PAYMENT", payment.getId(),
                request.getPaymentType() + " of " + request.getAmount());

        return toResponse(payment);
    }

    @Transactional
    public PaymentResponse verifyPayment(Long paymentId, boolean approved, String notes) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("Payment has already been processed");
        }

        User verifier = securityUtils.getCurrentUser();
        payment.setVerifiedBy(verifier);
        payment.setVerifiedAt(LocalDateTime.now());
        payment.setNotes(notes);

        if (approved) {
            payment.setStatus(PaymentStatus.VERIFIED);
            // Update booking financials
            Booking booking = payment.getBooking();
            if (payment.getPaymentType() == PaymentType.DEPOSIT) {
                booking.setDepositAmount(booking.getDepositAmount().add(payment.getAmount()));
                booking.setBalanceAmount(booking.getTotalAmount()
                        .add(booking.getAdditionalCharges())
                        .subtract(booking.getDepositAmount()));
            } else if (payment.getPaymentType() == PaymentType.BALANCE) {
                booking.setBalanceAmount(booking.getBalanceAmount().subtract(payment.getAmount()).max(BigDecimal.ZERO));
            } else if (payment.getPaymentType() == PaymentType.ADDITIONAL) {
                booking.setAdditionalCharges(booking.getAdditionalCharges().add(payment.getAmount()));
                booking.setBalanceAmount(booking.getBalanceAmount().add(payment.getAmount()));
            }
        } else {
            payment.setStatus(PaymentStatus.REJECTED);
        }

        payment = paymentRepository.save(payment);

        String result = approved ? "verified" : "rejected";
        notificationService.notify(payment.getBooking().getCustomer().getId(),
                "Payment " + (approved ? "Verified" : "Rejected"),
                "Your payment of LKR " + payment.getAmount() + " for " + payment.getBooking().getBookingRef() +
                        " has been " + result + ".",
                "PAYMENT", "PAYMENT", payment.getId());

        activityLogService.log(verifier.getId(), approved ? "VERIFY_PAYMENT" : "REJECT_PAYMENT",
                "PAYMENT", paymentId, result);

        return toResponse(payment);
    }

    @Transactional
    public PaymentResponse uploadReceipt(Long paymentId, String receiptPath) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        payment.setReceiptPath(receiptPath);
        payment = paymentRepository.save(payment);
        return toResponse(payment);
    }

    public List<PaymentResponse> getByBooking(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getPendingVerifications() {
        return paymentRepository.findByStatusOrderByCreatedAtDesc(PaymentStatus.PENDING).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getAll() {
        return paymentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalRevenue() {
        return paymentRepository.getTotalVerifiedRevenue();
    }

    public BigDecimal getOutstandingBalance() {
        return paymentRepository.getTotalOutstandingBalance();
    }

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .bookingId(p.getBooking().getId())
                .bookingRef(p.getBooking().getBookingRef())
                .amount(p.getAmount())
                .paymentType(p.getPaymentType())
                .paymentMethod(p.getPaymentMethod())
                .status(p.getStatus())
                .receiptPath(p.getReceiptPath())
                .verifiedById(p.getVerifiedBy() != null ? p.getVerifiedBy().getId() : null)
                .verifiedByName(p.getVerifiedBy() != null ? p.getVerifiedBy().getFullName() : null)
                .verifiedAt(p.getVerifiedAt())
                .notes(p.getNotes())
                .createdAt(p.getCreatedAt())
                .build();
    }
}

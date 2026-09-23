package com.snapflow.service;

import com.snapflow.dto.request.PaymentCreateRequest;
import com.snapflow.dto.request.PaymentVerificationRequest;
import com.snapflow.dto.response.PaymentResponse;
import com.snapflow.entity.Booking;
import com.snapflow.entity.Payment;
import com.snapflow.entity.User;
import com.snapflow.enums.BookingStatus;
import com.snapflow.enums.PaymentStatus;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ConflictException;
import com.snapflow.exception.ForbiddenException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.BookingRepository;
import com.snapflow.repository.PaymentRepository;
import com.snapflow.util.FileStorageService;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final FileStorageService fileStorageService;
    private final BookingService bookingService;
    private final SecurityUtils securityUtils;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    public PaymentResponse createPayment(PaymentCreateRequest request, MultipartFile receiptFile) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !booking.getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only submit payments for your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot submit payment for a cancelled booking");
        }

        String ref = request.getTransactionReference().trim();
        if (paymentRepository.existsByTransactionReference(ref)) {
            throw new ConflictException("Transaction reference already exists: " + ref);
        }

        String receiptFileName = null;
        String originalFileName = null;
        if (receiptFile != null && !receiptFile.isEmpty()) {
            receiptFileName = fileStorageService.storeReceipt(receiptFile);
            originalFileName = receiptFile.getOriginalFilename();
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .transactionReference(ref)
                .amount(request.getAmount())
                .paymentType(request.getPaymentType())
                .paymentDate(LocalDateTime.now())
                .receiptFilePath(receiptFileName)
                .receiptOriginalName(originalFileName)
                .status(PaymentStatus.PENDING)
                .build();

        Payment saved = paymentRepository.save(payment);
        auditService.log("PAYMENT_SUBMITTED",
                "Payment submitted: " + ref + " of LKR " + request.getAmount() + " for " + booking.getBookingRef());

        // Notify Finance
        notificationService.createNotification(
                booking.getCustomer().getId(),
                "Payment Received (" + ref + ")",
                "Your payment of LKR " + request.getAmount() + " has been recorded and is awaiting finance verification.",
                "PAYMENT",
                "/customer/bookings/" + booking.getId()
        );

        return mapToResponse(saved);
    }

    @Transactional
    public PaymentResponse verifyPayment(Long paymentId, PaymentVerificationRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("This payment is already " + payment.getStatus());
        }

        User verifier = securityUtils.getCurrentUser();
        payment.setStatus(request.getStatus());
        payment.setVerifiedBy(verifier);
        payment.setVerificationNotes(request.getVerificationNotes().trim());
        payment.setVerifiedAt(LocalDateTime.now());

        Booking booking = payment.getBooking();

        if (request.getStatus() == PaymentStatus.VERIFIED) {
            // Recalculate booking paid amount & balance amount
            BigDecimal newPaid = booking.getPaidAmount().add(payment.getAmount());
            booking.setPaidAmount(newPaid);
            booking.setBalanceAmount(booking.getTotalAmount().subtract(newPaid));

            // If booking was PENDING, auto-confirm upon first verified payment
            if (booking.getStatus() == BookingStatus.PENDING) {
                booking.setStatus(BookingStatus.CONFIRMED);
            }
            bookingRepository.save(booking);

            auditService.log("PAYMENT_VERIFIED",
                    "Payment verified: " + payment.getTransactionReference() + " for " + booking.getBookingRef());

            notificationService.createNotification(
                    booking.getCustomer().getId(),
                    "Payment Verified (" + payment.getTransactionReference() + ")",
                    "Your payment of LKR " + payment.getAmount() + " has been verified. Remaining balance: LKR " + booking.getBalanceAmount(),
                    "PAYMENT",
                    "/customer/bookings/" + booking.getId()
            );
        } else {
            auditService.log("PAYMENT_REJECTED",
                    "Payment rejected: " + payment.getTransactionReference() + " for " + booking.getBookingRef());

            notificationService.createNotification(
                    booking.getCustomer().getId(),
                    "Payment Verification Failed (" + payment.getTransactionReference() + ")",
                    "Your payment could not be verified. Notes: " + request.getVerificationNotes(),
                    "PAYMENT",
                    "/customer/bookings/" + booking.getId()
            );
        }

        Payment updated = paymentRepository.save(payment);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public Resource getReceiptResource(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !payment.getBooking().getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You cannot access another customer's receipt");
        }

        if (payment.getReceiptFilePath() == null) {
            throw new ResourceNotFoundException("Receipt file not found for this payment");
        }

        return fileStorageService.loadReceiptAsResource(payment.getReceiptFilePath());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !payment.getBooking().getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You cannot access another customer's payment details");
        }

        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public Page<PaymentResponse> filterPayments(PaymentStatus status, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return paymentRepository.filterPayments(status, start, end, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getBookingPayments(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        bookingService.validateBookingAccess(booking);
        return paymentRepository.findByBookingIdOrderByPaymentDateDesc(bookingId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<PaymentResponse> getPendingPayments(Pageable pageable) {
        return paymentRepository.findByStatus(PaymentStatus.PENDING, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public byte[] exportPaymentsCsv(PaymentStatus status, LocalDateTime start, LocalDateTime end) {
        List<Payment> list = paymentRepository.exportPaymentsReport(status, start, end);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter pw = new PrintWriter(baos);

        pw.println("Payment ID,Booking Ref,Customer Name,Transaction Ref,Payment Type,Amount (LKR),Payment Date,Status,Verified By,Verification Notes");
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        for (Payment p : list) {
            pw.printf("%d,%s,%s,%s,%s,%.2f,%s,%s,%s,%s%n",
                    p.getId(),
                    escapeCsv(p.getBooking().getBookingRef()),
                    escapeCsv(p.getBooking().getCustomer().getFullName()),
                    escapeCsv(p.getTransactionReference()),
                    p.getPaymentType(),
                    p.getAmount(),
                    p.getPaymentDate() != null ? p.getPaymentDate().format(dtf) : "",
                    p.getStatus(),
                    escapeCsv(p.getVerifiedBy() != null ? p.getVerifiedBy().getFullName() : ""),
                    escapeCsv(p.getVerificationNotes() != null ? p.getVerificationNotes() : "")
            );
        }
        pw.flush();
        return baos.toByteArray();
    }

    @Scheduled(cron = "0 0 9 * * *") // Daily at 9:00 AM
    @Transactional
    public void triggerAutomatedBalanceReminders() {
        LocalDate twoWeeksAhead = LocalDate.now().plusDays(14);
        List<Booking> upcomingBookings = bookingRepository.findBookingsNeedingBalanceReminder(twoWeeksAhead);

        log.info("Running automated 14-day balance reminder check. Found {} bookings.", upcomingBookings.size());

        for (Booking b : upcomingBookings) {
            notificationService.createNotification(
                    b.getCustomer().getId(),
                    "Balance Reminder (" + b.getBookingRef() + ")",
                    String.format("Your event '%s' is in 14 days (%s). Outstanding balance: LKR %.2f. Please submit your payment receipt.",
                            b.getEventType(), b.getEventDate(), b.getBalanceAmount()),
                    "FINANCE_REMINDER",
                    "/customer/bookings/" + b.getId()
            );
        }
    }

    @Transactional
    public void sendManualBalanceReminder(Long bookingId) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (b.getBalanceAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Booking has no outstanding balance");
        }

        notificationService.createNotification(
                b.getCustomer().getId(),
                "Payment Balance Reminder (" + b.getBookingRef() + ")",
                String.format("Reminder: Outstanding balance of LKR %.2f is pending for your event on %s.",
                        b.getBalanceAmount(), b.getEventDate()),
                "FINANCE_REMINDER",
                "/customer/bookings/" + b.getId()
        );

        auditService.log("BALANCE_REMINDER_SENT", "Manual balance reminder sent for " + b.getBookingRef());
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        char q = '"';
        return q + val.replace("\"", "\"\"") + q;
    }

    public PaymentResponse mapToResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .bookingId(p.getBooking().getId())
                .bookingRef(p.getBooking().getBookingRef())
                .customerName(p.getBooking().getCustomer().getFullName())
                .transactionReference(p.getTransactionReference())
                .amount(p.getAmount())
                .paymentType(p.getPaymentType())
                .paymentDate(p.getPaymentDate())
                .receiptOriginalName(p.getReceiptOriginalName())
                .status(p.getStatus())
                .verifiedById(p.getVerifiedBy() != null ? p.getVerifiedBy().getId() : null)
                .verifiedByName(p.getVerifiedBy() != null ? p.getVerifiedBy().getFullName() : null)
                .verificationNotes(p.getVerificationNotes())
                .verifiedAt(p.getVerifiedAt())
                .createdAt(p.getCreatedAt())
                .build();
    }
}

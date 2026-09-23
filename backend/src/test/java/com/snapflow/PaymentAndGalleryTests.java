package com.snapflow;

import com.snapflow.dto.request.GalleryCreateRequest;
import com.snapflow.dto.request.PaymentCreateRequest;
import com.snapflow.dto.request.PaymentVerificationRequest;
import com.snapflow.dto.response.GalleryResponse;
import com.snapflow.dto.response.PaymentResponse;
import com.snapflow.entity.Booking;
import com.snapflow.entity.Package;
import com.snapflow.entity.User;
import com.snapflow.enums.BookingStatus;
import com.snapflow.enums.PaymentStatus;
import com.snapflow.enums.PaymentType;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ForbiddenException;
import com.snapflow.repository.BookingRepository;
import com.snapflow.repository.PackageRepository;
import com.snapflow.repository.UserRepository;
import com.snapflow.security.UserPrincipal;
import com.snapflow.service.GalleryService;
import com.snapflow.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class PaymentAndGalleryTests {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private GalleryService galleryService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private UserRepository userRepository;

    private User customer;
    private User financeUser;
    private Booking booking;

    @BeforeEach
    void setUp() {
        customer = userRepository.save(User.builder()
                .fullName("John Doe")
                .email("john@test.com")
                .password("encoded")
                .role(Role.CUSTOMER)
                .active(true)
                .build());

        financeUser = userRepository.save(User.builder()
                .fullName("Finance Officer")
                .email("fin@test.com")
                .password("encoded")
                .role(Role.FINANCE_EXECUTIVE)
                .active(true)
                .build());

        Package pkg = packageRepository.save(Package.builder()
                .name("Standard")
                .price(new BigDecimal("100000.00"))
                .durationHours(6)
                .features("Features")
                .category("Wedding")
                .active(true)
                .build());

        booking = bookingRepository.save(Booking.builder()
                .bookingRef("SF-TEST-PAY-01")
                .customer(customer)
                .photographyPackage(pkg)
                .eventDate(LocalDate.now().plusDays(20))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(16, 0))
                .venue("Galle Face Hotel")
                .eventType("Wedding")
                .packagePrice(new BigDecimal("100000.00"))
                .totalAmount(new BigDecimal("100000.00"))
                .paidAmount(BigDecimal.ZERO)
                .balanceAmount(new BigDecimal("100000.00"))
                .status(BookingStatus.PENDING)
                .build());
    }

    @Test
    @DisplayName("Payment verification by finance updates booking paid amount and recalculates balance")
    void testPaymentVerificationUpdatesBalance() {
        UserPrincipal custPrincipal = UserPrincipal.create(customer);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(custPrincipal, null, custPrincipal.getAuthorities())
        );

        PaymentCreateRequest payReq = new PaymentCreateRequest();
        payReq.setBookingId(booking.getId());
        payReq.setTransactionReference("TXN-TEST-12345");
        payReq.setAmount(new BigDecimal("40000.00"));
        payReq.setPaymentType(PaymentType.ADVANCE_DEPOSIT);

        PaymentResponse submitted = paymentService.createPayment(payReq, null);
        assertEquals(PaymentStatus.PENDING, submitted.getStatus());

        // Switch to Finance Executive
        UserPrincipal finPrincipal = UserPrincipal.create(financeUser);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(finPrincipal, null, finPrincipal.getAuthorities())
        );

        PaymentVerificationRequest verifyReq = new PaymentVerificationRequest();
        verifyReq.setStatus(PaymentStatus.VERIFIED);
        verifyReq.setVerificationNotes("Bank slip verified.");

        PaymentResponse verified = paymentService.verifyPayment(submitted.getId(), verifyReq);
        assertEquals(PaymentStatus.VERIFIED, verified.getStatus());

        Booking updatedBooking = bookingRepository.findById(booking.getId()).orElseThrow();
        assertEquals(new BigDecimal("40000.00"), updatedBooking.getPaidAmount());
        assertEquals(new BigDecimal("60000.00"), updatedBooking.getBalanceAmount());
        assertEquals(BookingStatus.CONFIRMED, updatedBooking.getStatus());
    }

    @Test
    @DisplayName("Gallery can only be created for IN_PROGRESS or COMPLETED events")
    void testGalleryCreationEligibility() {
        UserPrincipal finPrincipal = UserPrincipal.create(financeUser);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(finPrincipal, null, finPrincipal.getAuthorities())
        );

        GalleryCreateRequest galReq = new GalleryCreateRequest();
        galReq.setBookingId(booking.getId());
        galReq.setTitle("My Wedding Gallery");

        // Booking is currently PENDING/CONFIRMED -> gallery creation must fail
        assertThrows(BadRequestException.class, () -> galleryService.createGallery(galReq));

        // Advance booking to IN_PROGRESS
        booking.setStatus(BookingStatus.IN_PROGRESS);
        bookingRepository.save(booking);

        GalleryResponse gal = galleryService.createGallery(galReq);
        assertNotNull(gal);
        assertNotNull(gal.getAccessCode());
        assertEquals(8, gal.getAccessCode().length());
    }

    @Test
    @DisplayName("Public access code lookup works only for published galleries")
    void testPublicGalleryAccessControl() {
        UserPrincipal finPrincipal = UserPrincipal.create(financeUser);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(finPrincipal, null, finPrincipal.getAuthorities())
        );

        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        GalleryCreateRequest galReq = new GalleryCreateRequest();
        galReq.setBookingId(booking.getId());
        galReq.setTitle("Published Gallery");
        GalleryResponse gal = galleryService.createGallery(galReq);

        // Draft gallery lookup by access code must throw ForbiddenException
        assertThrows(ForbiddenException.class, () -> galleryService.getPublicGalleryByAccessCode(gal.getAccessCode()));
    }
}

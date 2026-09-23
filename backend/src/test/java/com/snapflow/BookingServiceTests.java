package com.snapflow;

import com.snapflow.dto.request.AvailabilityCheckRequest;
import com.snapflow.dto.request.BookingCreateRequest;
import com.snapflow.dto.request.BookingStatusTransitionRequest;
import com.snapflow.dto.response.AvailabilityCheckResponse;
import com.snapflow.dto.response.BookingResponse;
import com.snapflow.entity.AddOn;
import com.snapflow.entity.Package;
import com.snapflow.entity.User;
import com.snapflow.enums.BookingStatus;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.repository.AddOnRepository;
import com.snapflow.repository.BookingRepository;
import com.snapflow.repository.PackageRepository;
import com.snapflow.repository.UserRepository;
import com.snapflow.security.UserPrincipal;
import com.snapflow.service.BookingService;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class BookingServiceTests {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private AddOnRepository addOnRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private User customer;
    private User photographer;
    private Package testPackage;
    private AddOn testAddOn;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        userRepository.deleteAll();
        packageRepository.deleteAll();
        addOnRepository.deleteAll();

        customer = userRepository.save(User.builder()
                .fullName("Customer One")
                .email("cust@test.com")
                .password("encodedPass")
                .phone("0771112222")
                .role(Role.CUSTOMER)
                .active(true)
                .build());

        photographer = userRepository.save(User.builder()
                .fullName("Photo One")
                .email("photo@test.com")
                .password("encodedPass")
                .phone("0773334444")
                .role(Role.PHOTOGRAPHER)
                .active(true)
                .build());

        testPackage = packageRepository.save(Package.builder()
                .name("Standard Package")
                .description("Sample desc")
                .price(new BigDecimal("50000.00"))
                .durationHours(5)
                .features("Photos")
                .category("Wedding")
                .active(true)
                .build());

        testAddOn = addOnRepository.save(AddOn.builder()
                .name("Drone Coverage")
                .description("Drone video")
                .price(new BigDecimal("15000.00"))
                .active(true)
                .build());

        UserPrincipal principal = UserPrincipal.create(customer);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );
    }

    @Test
    @DisplayName("Availability check reports available when photographer is free")
    void testAvailabilityCheck() {
        AvailabilityCheckRequest req = new AvailabilityCheckRequest();
        req.setEventDate(LocalDate.now().plusDays(5));
        req.setStartTime(LocalTime.of(10, 0));
        req.setDurationHours(4);
        req.setPreferredPhotographerId(photographer.getId());

        AvailabilityCheckResponse resp = bookingService.checkAvailability(req);
        assertTrue(resp.isGeneralAvailable());
        assertTrue(resp.getPreferredPhotographerAvailable());
        assertFalse(resp.getAvailablePhotographers().isEmpty());
    }

    @Test
    @DisplayName("Booking creation accurately snapshots package, add-ons, and calculates total balance")
    void testBookingCreationCalculations() {
        BookingCreateRequest req = new BookingCreateRequest();
        req.setPackageId(testPackage.getId());
        req.setPreferredPhotographerId(photographer.getId());
        req.setEventDate(LocalDate.now().plusDays(10));
        req.setStartTime(LocalTime.of(9, 0));
        req.setVenue("Grand Ballroom");
        req.setEventType("Wedding");
        req.setAddOnIds(List.of(testAddOn.getId()));

        BookingResponse resp = bookingService.createBooking(req);

        assertNotNull(resp);
        assertTrue(resp.getBookingRef().startsWith("SF-"));
        assertEquals(BookingStatus.PENDING, resp.getStatus());
        assertEquals(LocalTime.of(14, 0), resp.getEndTime()); // 9:00 + 5 hours
        assertEquals(new BigDecimal("50000.00"), resp.getPackagePrice());
        assertEquals(new BigDecimal("15000.00"), resp.getAddOnsPrice());
        assertEquals(new BigDecimal("65000.00"), resp.getTotalAmount());
        assertEquals(new BigDecimal("65000.00"), resp.getBalanceAmount());
        assertEquals(BigDecimal.ZERO, resp.getPaidAmount());
    }

    @Test
    @DisplayName("Valid status transitions follow workflow and disallow illegal jumps")
    void testStatusTransitions() {
        BookingCreateRequest req = new BookingCreateRequest();
        req.setPackageId(testPackage.getId());
        req.setEventDate(LocalDate.now().plusDays(10));
        req.setStartTime(LocalTime.of(9, 0));
        req.setVenue("Grand Ballroom");
        req.setEventType("Wedding");

        BookingResponse b = bookingService.createBooking(req);

        // Switch to Director to perform status transitions
        User director = userRepository.save(User.builder()
                .fullName("Director")
                .email("dir@test.com")
                .password("encoded")
                .role(Role.COMPANY_DIRECTOR)
                .active(true)
                .build());
        UserPrincipal dirPrincipal = UserPrincipal.create(director);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(dirPrincipal, null, dirPrincipal.getAuthorities())
        );

        // PENDING -> CONFIRMED (Valid)
        BookingStatusTransitionRequest t1 = new BookingStatusTransitionRequest();
        t1.setNewStatus(BookingStatus.CONFIRMED);
        BookingResponse r1 = bookingService.transitionBookingStatus(b.getId(), t1);
        assertEquals(BookingStatus.CONFIRMED, r1.getStatus());

        // CONFIRMED -> COMPLETED (Invalid jump - must go through ASSIGNED and IN_PROGRESS)
        BookingStatusTransitionRequest tInvalid = new BookingStatusTransitionRequest();
        tInvalid.setNewStatus(BookingStatus.COMPLETED);
        assertThrows(BadRequestException.class, () -> bookingService.transitionBookingStatus(b.getId(), tInvalid));
    }

    @Test
    @DisplayName("Completed booking cannot be cancelled")
    void testCompletedBookingCannotBeCancelled() {
        BookingCreateRequest req = new BookingCreateRequest();
        req.setPackageId(testPackage.getId());
        req.setEventDate(LocalDate.now().plusDays(10));
        req.setStartTime(LocalTime.of(9, 0));
        req.setVenue("Grand Ballroom");
        req.setEventType("Wedding");
        BookingResponse b = bookingService.createBooking(req);

        User director = userRepository.save(User.builder()
                .fullName("Director 2")
                .email("dir2@test.com")
                .password("encoded")
                .role(Role.COMPANY_DIRECTOR)
                .active(true)
                .build());
        UserPrincipal dirPrincipal = UserPrincipal.create(director);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(dirPrincipal, null, dirPrincipal.getAuthorities())
        );

        // Advance to COMPLETED step by step
        BookingStatusTransitionRequest t1 = new BookingStatusTransitionRequest();
        t1.setNewStatus(BookingStatus.CONFIRMED);
        bookingService.transitionBookingStatus(b.getId(), t1);

        BookingStatusTransitionRequest t2 = new BookingStatusTransitionRequest();
        t2.setNewStatus(BookingStatus.ASSIGNED);
        bookingService.transitionBookingStatus(b.getId(), t2);

        BookingStatusTransitionRequest t3 = new BookingStatusTransitionRequest();
        t3.setNewStatus(BookingStatus.IN_PROGRESS);
        bookingService.transitionBookingStatus(b.getId(), t3);

        BookingStatusTransitionRequest t4 = new BookingStatusTransitionRequest();
        t4.setNewStatus(BookingStatus.COMPLETED);
        bookingService.transitionBookingStatus(b.getId(), t4);

        assertThrows(BadRequestException.class, () -> bookingService.cancelBooking(b.getId(), "Try cancel"));
    }
}

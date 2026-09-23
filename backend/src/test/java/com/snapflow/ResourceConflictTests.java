package com.snapflow;

import com.snapflow.dto.request.AssignmentCreateRequest;
import com.snapflow.dto.request.BookingCreateRequest;
import com.snapflow.dto.request.EquipmentAllocationRequest;
import com.snapflow.dto.request.EquipmentRequest;
import com.snapflow.entity.Booking;
import com.snapflow.entity.Package;
import com.snapflow.entity.User;
import com.snapflow.enums.Role;
import com.snapflow.exception.ConflictException;
import com.snapflow.repository.BookingRepository;
import com.snapflow.repository.PackageRepository;
import com.snapflow.repository.UserRepository;
import com.snapflow.security.UserPrincipal;
import com.snapflow.service.AssignmentService;
import com.snapflow.service.BookingService;
import com.snapflow.service.EquipmentService;
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

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ResourceConflictTests {

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private EquipmentService equipmentService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private User opsManager;
    private User photographer;
    private Package pkg;

    @BeforeEach
    void setUp() {
        opsManager = userRepository.save(User.builder()
                .fullName("Ops Manager")
                .email("ops@test.com")
                .password("encoded")
                .role(Role.OPERATIONS_MANAGER)
                .active(true)
                .build());

        photographer = userRepository.save(User.builder()
                .fullName("Photographer Pro")
                .email("pro@test.com")
                .password("encoded")
                .role(Role.PHOTOGRAPHER)
                .active(true)
                .build());

        User customer = userRepository.save(User.builder()
                .fullName("Customer")
                .email("customer@test.com")
                .password("encoded")
                .role(Role.CUSTOMER)
                .active(true)
                .build());

        pkg = packageRepository.save(Package.builder()
                .name("Event Package")
                .price(new BigDecimal("40000.00"))
                .durationHours(4)
                .features("Photography")
                .category("Event")
                .active(true)
                .build());

        UserPrincipal opsPrincipal = UserPrincipal.create(opsManager);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(opsPrincipal, null, opsPrincipal.getAuthorities())
        );
    }

    @Test
    @DisplayName("Photographer overlap conflict detection prevents double booking")
    void testPhotographerOverlapConflict() {
        LocalDate eventDate = LocalDate.now().plusDays(7);

        // Booking 1: 10:00 to 14:00
        Booking b1 = bookingRepository.save(Booking.builder()
                .bookingRef("SF-TEST-001")
                .customer(opsManager)
                .photographyPackage(pkg)
                .eventDate(eventDate)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(14, 0))
                .venue("Venue 1")
                .eventType("Wedding")
                .packagePrice(pkg.getPrice())
                .totalAmount(pkg.getPrice())
                .balanceAmount(pkg.getPrice())
                .build());

        // Booking 2: 12:00 to 16:00 (Overlaps with Booking 1)
        Booking b2 = bookingRepository.save(Booking.builder()
                .bookingRef("SF-TEST-002")
                .customer(opsManager)
                .photographyPackage(pkg)
                .eventDate(eventDate)
                .startTime(LocalTime.of(12, 0))
                .endTime(LocalTime.of(16, 0))
                .venue("Venue 2")
                .eventType("Birthday")
                .packagePrice(pkg.getPrice())
                .totalAmount(pkg.getPrice())
                .balanceAmount(pkg.getPrice())
                .build());

        // Assign to B1
        AssignmentCreateRequest req1 = new AssignmentCreateRequest();
        req1.setBookingId(b1.getId());
        req1.setPhotographerId(photographer.getId());
        assignmentService.assignPhotographer(req1);

        // Assigning same photographer to B2 must throw ConflictException
        AssignmentCreateRequest req2 = new AssignmentCreateRequest();
        req2.setBookingId(b2.getId());
        req2.setPhotographerId(photographer.getId());

        assertThrows(ConflictException.class, () -> assignmentService.assignPhotographer(req2));
    }

    @Test
    @DisplayName("Equipment overlap conflict detection prevents double allocation")
    void testEquipmentOverlapConflict() {
        LocalDate eventDate = LocalDate.now().plusDays(7);

        Booking b1 = bookingRepository.save(Booking.builder()
                .bookingRef("SF-TEST-003")
                .customer(opsManager)
                .photographyPackage(pkg)
                .eventDate(eventDate)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(14, 0))
                .venue("Venue 1")
                .eventType("Wedding")
                .packagePrice(pkg.getPrice())
                .totalAmount(pkg.getPrice())
                .balanceAmount(pkg.getPrice())
                .build());

        Booking b2 = bookingRepository.save(Booking.builder()
                .bookingRef("SF-TEST-004")
                .customer(opsManager)
                .photographyPackage(pkg)
                .eventDate(eventDate)
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(15, 0))
                .venue("Venue 2")
                .eventType("Party")
                .packagePrice(pkg.getPrice())
                .totalAmount(pkg.getPrice())
                .balanceAmount(pkg.getPrice())
                .build());

        EquipmentRequest eqReq = new EquipmentRequest();
        eqReq.setName("Sony A7IV");
        eqReq.setCategory("Camera");
        eqReq.setSerialNumber("SN-TEST-001");
        var eq = equipmentService.createEquipment(eqReq);

        // Allocate to B1
        EquipmentAllocationRequest alloc1 = new EquipmentAllocationRequest();
        alloc1.setEquipmentId(eq.getId());
        alloc1.setBookingId(b1.getId());
        alloc1.setPhotographerId(photographer.getId());
        equipmentService.allocateEquipment(alloc1);

        // Allocate same equipment to B2 on overlapping time
        EquipmentAllocationRequest alloc2 = new EquipmentAllocationRequest();
        alloc2.setEquipmentId(eq.getId());
        alloc2.setBookingId(b2.getId());
        alloc2.setPhotographerId(photographer.getId());

        assertThrows(ConflictException.class, () -> equipmentService.allocateEquipment(alloc2));
    }
}

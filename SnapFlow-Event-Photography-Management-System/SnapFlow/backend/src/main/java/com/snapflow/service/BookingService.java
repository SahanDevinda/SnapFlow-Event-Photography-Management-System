package com.snapflow.service;

import com.snapflow.enums.BookingStatus;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.AddOnRepository;
import com.snapflow.repository.BookingRepository;
import com.snapflow.repository.UserRepository;
import com.snapflow.util.BookingRefGenerator;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PackageService packageService;
    private final AddOnRepository addOnRepository;
    private final BookingRefGenerator bookingRefGenerator;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        // Determine customer: either self (CUSTOMER) or specified (CRO)
        User customer;
        if (currentUser.getRole() == Role.CUSTOMER) {
            customer = currentUser;
        } else if (currentUser.getRole() == Role.CUSTOMER_RELATIONS_OFFICER
                || currentUser.getRole() == Role.COMPANY_DIRECTOR) {
            if (request.getCustomerId() == null) {
                throw new BadRequestException("Customer ID is required when creating booking on behalf of a client");
            }
            customer = userRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        } else {
            throw new BadRequestException("You are not allowed to create bookings");
        }

        com.snapflow.entity.Package pkg = packageService.getEntityById(request.getPackageId());
        if (Boolean.FALSE.equals(pkg.getIsActive())) {
            throw new BadRequestException("Selected package is not available");
        }

        BigDecimal total = pkg.getPrice();
        Set<AddOn> addOns = new HashSet<>();
        if (request.getAddOnIds() != null && !request.getAddOnIds().isEmpty()) {
            for (Long addOnId : request.getAddOnIds()) {
                AddOn addOn = addOnRepository.findById(addOnId)
                        .orElseThrow(() -> new ResourceNotFoundException("Add-on not found: " + addOnId));
                addOns.add(addOn);
                total = total.add(addOn.getPrice());
            }
        }

        // Default deposit = 30%
        BigDecimal deposit = total.multiply(new BigDecimal("0.30")).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal balance = total.subtract(deposit);

        Booking booking = Booking.builder()
                .bookingRef(bookingRefGenerator.generate())
                .customer(customer)
                .photographyPackage(pkg)
                .eventDate(request.getEventDate())
                .eventTime(request.getEventTime())
                .venue(request.getVenue())
                .eventType(request.getEventType())
                .specialRequests(request.getSpecialRequests())
                .status(BookingStatus.PENDING)
                .totalAmount(total)
                .depositAmount(deposit)
                .balanceAmount(balance)
                .additionalCharges(BigDecimal.ZERO)
                .addOns(addOns)
                .build();

        booking = bookingRepository.save(booking);

        // Notify customer and CRO/Ops
        notificationService.notify(customer.getId(), "Booking Submitted",
                "Your booking " + booking.getBookingRef() + " has been submitted and is pending confirmation.",
                "BOOKING", "BOOKING", booking.getId());

        activityLogService.log(currentUser.getId(), "CREATE_BOOKING", "BOOKING", booking.getId(),
                "Created booking " + booking.getBookingRef());

        return toResponse(booking);
    }

    public BookingResponse getById(Long id) {
        Booking booking = getEntityById(id);
        return toResponse(booking);
    }

    public BookingResponse getByRef(String ref) {
        Booking booking = bookingRepository.findByBookingRef(ref)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + ref));
        return toResponse(booking);
    }

    public List<BookingResponse> getMyBookings() {
        User current = securityUtils.getCurrentUser();
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(current.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse updateStatus(Long id, BookingStatus newStatus) {
        Booking booking = getEntityById(id);
        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(newStatus);
        booking = bookingRepository.save(booking);

        notificationService.notify(booking.getCustomer().getId(), "Booking Status Updated",
                "Your booking " + booking.getBookingRef() + " status changed from " + oldStatus + " to " + newStatus,
                "BOOKING", "BOOKING", booking.getId());

        activityLogService.log(securityUtils.getCurrentUserId(), "UPDATE_BOOKING_STATUS", "BOOKING", id,
                "Status: " + oldStatus + " → " + newStatus);

        return toResponse(booking);
    }

    public Booking getEntityById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    public BookingResponse toResponse(Booking b) {
        List<BookingResponse.AssignmentSummary> assignments = b.getAssignments() != null
                ? b.getAssignments().stream().map(a -> BookingResponse.AssignmentSummary.builder()
                        .assignmentId(a.getId())
                        .photographerId(a.getPhotographer().getId())
                        .photographerName(a.getPhotographer().getFullName())
                        .status(a.getStatus().name())
                        .attendanceConfirmed(a.getAttendanceConfirmed())
                        .build()).collect(Collectors.toList())
                : List.of();

        List<String> addOnNames = b.getAddOns() != null
                ? b.getAddOns().stream().map(AddOn::getName).collect(Collectors.toList())
                : List.of();

        return BookingResponse.builder()
                .id(b.getId())
                .bookingRef(b.getBookingRef())
                .customerId(b.getCustomer().getId())
                .customerName(b.getCustomer().getFullName())
                .customerEmail(b.getCustomer().getEmail())
                .packageId(b.getPhotographyPackage().getId())
                .packageName(b.getPhotographyPackage().getName())
                .eventDate(b.getEventDate())
                .eventTime(b.getEventTime())
                .venue(b.getVenue())
                .eventType(b.getEventType())
                .specialRequests(b.getSpecialRequests())
                .status(b.getStatus())
                .totalAmount(b.getTotalAmount())
                .depositAmount(b.getDepositAmount())
                .balanceAmount(b.getBalanceAmount())
                .additionalCharges(b.getAdditionalCharges())
                .notes(b.getNotes())
                .addOnNames(addOnNames)
                .assignments(assignments)
                .createdAt(b.getCreatedAt())
                .build();
    }
}

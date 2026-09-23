package com.snapflow.service;

import com.snapflow.dto.request.AvailabilityCheckRequest;
import com.snapflow.dto.request.BookingCreateRequest;
import com.snapflow.dto.request.BookingStatusTransitionRequest;
import com.snapflow.dto.request.BookingUpdateRequest;
import com.snapflow.dto.response.*;
import com.snapflow.entity.Package;
import com.snapflow.entity.*;
import com.snapflow.enums.AssignmentStatus;
import com.snapflow.enums.BookingStatus;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ForbiddenException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.*;
import com.snapflow.util.ReferenceGenerator;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingStatusHistoryRepository statusHistoryRepository;
    private final PackageRepository packageRepository;
    private final AddOnRepository addOnRepository;
    private final UserRepository userRepository;
    private final PhotographerAssignmentRepository assignmentRepository;
    private final ReferenceGenerator referenceGenerator;
    private final SecurityUtils securityUtils;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public AvailabilityCheckResponse checkAvailability(AvailabilityCheckRequest request) {
        LocalTime endTime = request.getStartTime().plusHours(request.getDurationHours());
        List<User> activePhotographers = userRepository.findByRoleAndActiveTrue(Role.PHOTOGRAPHER);

        List<UserResponse> availableList = new ArrayList<>();
        Boolean preferredPhotographerAvailable = null;

        for (User photographer : activePhotographers) {
            List<PhotographerAssignment> conflicts = assignmentRepository.findConflictingAssignments(
                    photographer.getId(), request.getEventDate(), request.getStartTime(), endTime, null
            );
            if (conflicts.isEmpty()) {
                availableList.add(UserService.mapToUserResponse(photographer));
            }
        }

        if (request.getPreferredPhotographerId() != null) {
            final Long prefId = request.getPreferredPhotographerId();
            preferredPhotographerAvailable = availableList.stream().anyMatch(p -> p.getId().equals(prefId));
        }

        boolean generalAvailable = !availableList.isEmpty();
        String message = generalAvailable
                ? "Date and time slot are available! " + availableList.size() + " photographer(s) available."
                : "No photographers are available for the selected date and time.";

        return AvailabilityCheckResponse.builder()
                .eventDate(request.getEventDate())
                .startTime(request.getStartTime())
                .endTime(endTime)
                .generalAvailable(generalAvailable)
                .preferredPhotographerAvailable(preferredPhotographerAvailable)
                .availablePhotographers(availableList)
                .message(message)
                .build();
    }

    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        User customer;

        if (request.getCustomerId() != null &&
                (currentUser.getRole() == Role.CUSTOMER_RELATIONS_OFFICER || currentUser.getRole() == Role.COMPANY_DIRECTOR)) {
            customer = userRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));
        } else {
            customer = currentUser;
        }

        Package pkg = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", request.getPackageId()));

        LocalTime endTime = request.getStartTime().plusHours(pkg.getDurationHours());

        User preferredPhotographer = null;
        if (request.getPreferredPhotographerId() != null) {
            preferredPhotographer = userRepository.findById(request.getPreferredPhotographerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Photographer", "id", request.getPreferredPhotographerId()));
            if (preferredPhotographer.getRole() != Role.PHOTOGRAPHER) {
                throw new BadRequestException("Requested preferred photographer is not a photographer");
            }
        }

        BigDecimal packagePrice = pkg.getPrice();
        BigDecimal addOnsTotal = BigDecimal.ZERO;
        List<BookingAddOn> bookingAddOns = new ArrayList<>();

        Booking booking = Booking.builder()
                .bookingRef(referenceGenerator.generateBookingReference())
                .customer(customer)
                .photographyPackage(pkg)
                .preferredPhotographer(preferredPhotographer)
                .eventDate(request.getEventDate())
                .startTime(request.getStartTime())
                .endTime(endTime)
                .venue(request.getVenue().trim())
                .eventType(request.getEventType().trim())
                .specialRequests(request.getSpecialRequests())
                .status(BookingStatus.PENDING)
                .packagePrice(packagePrice)
                .addOnsPrice(BigDecimal.ZERO)
                .additionalCharges(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .paidAmount(BigDecimal.ZERO)
                .balanceAmount(BigDecimal.ZERO)
                .build();

        if (request.getAddOnIds() != null && !request.getAddOnIds().isEmpty()) {
            for (Long addOnId : request.getAddOnIds()) {
                AddOn addOn = addOnRepository.findById(addOnId)
                        .orElseThrow(() -> new ResourceNotFoundException("AddOn", "id", addOnId));
                BookingAddOn bao = BookingAddOn.builder()
                        .id(new BookingAddOnId(null, addOn.getId()))
                        .booking(booking)
                        .addOn(addOn)
                        .unitPrice(addOn.getPrice())
                        .build();
                bookingAddOns.add(bao);
                addOnsTotal = addOnsTotal.add(addOn.getPrice());
            }
        }

        BigDecimal total = packagePrice.add(addOnsTotal);
        booking.setAddOnsPrice(addOnsTotal);
        booking.setTotalAmount(total);
        booking.setBalanceAmount(total);
        booking.setBookingAddOns(bookingAddOns);

        Booking saved = bookingRepository.save(booking);

        BookingStatusHistory history = BookingStatusHistory.builder()
                .booking(saved)
                .fromStatus(null)
                .toStatus(BookingStatus.PENDING)
                .remarks("Booking created")
                .changedBy(currentUser)
                .build();
        statusHistoryRepository.save(history);

        auditService.log("BOOKING_CREATE", "Booking created: " + saved.getBookingRef() + " for " + customer.getEmail());

        notificationService.createNotification(
                customer.getId(),
                "Booking Placed (" + saved.getBookingRef() + ")",
                "Your booking request for " + pkg.getName() + " on " + saved.getEventDate() + " has been received.",
                "BOOKING",
                "/customer/bookings/" + saved.getId()
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<BookingSummaryResponse> getMyBookings(Pageable pageable) {
        Long customerId = securityUtils.getCurrentUserId();
        return bookingRepository.findByCustomerId(customerId, pageable)
                .map(this::mapToSummaryResponse);
    }

    @Transactional(readOnly = true)
    public Page<BookingSummaryResponse> filterBookings(Long customerId, BookingStatus status, LocalDate startDate,
                                                      LocalDate endDate, String search, Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER) {
            customerId = currentUser.getId();
        }
        return bookingRepository.filterBookings(customerId, status, startDate, endDate, search, pageable)
                .map(this::mapToSummaryResponse);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        validateBookingAccess(booking);
        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingByRef(String bookingRef) {
        Booking booking = bookingRepository.findByBookingRef(bookingRef)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "bookingRef", bookingRef));
        validateBookingAccess(booking);
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse updateBooking(Long id, BookingUpdateRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        validateBookingAccess(booking);

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot edit a " + booking.getStatus() + " booking");
        }

        if (request.getPackageId() != null && !request.getPackageId().equals(booking.getPhotographyPackage().getId())) {
            Package newPkg = packageRepository.findById(request.getPackageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Package", "id", request.getPackageId()));
            booking.setPhotographyPackage(newPkg);
            booking.setPackagePrice(newPkg.getPrice());
            booking.setEndTime(booking.getStartTime().plusHours(newPkg.getDurationHours()));
        }

        if (request.getPreferredPhotographerId() != null) {
            User pref = userRepository.findById(request.getPreferredPhotographerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getPreferredPhotographerId()));
            booking.setPreferredPhotographer(pref);
        }

        if (request.getEventDate() != null) {
            booking.setEventDate(request.getEventDate());
        }
        if (request.getStartTime() != null) {
            booking.setStartTime(request.getStartTime());
            booking.setEndTime(request.getStartTime().plusHours(booking.getPhotographyPackage().getDurationHours()));
        }
        if (request.getVenue() != null) {
            booking.setVenue(request.getVenue().trim());
        }
        if (request.getEventType() != null) {
            booking.setEventType(request.getEventType().trim());
        }
        if (request.getSpecialRequests() != null) {
            booking.setSpecialRequests(request.getSpecialRequests());
        }
        if (request.getInternalNotes() != null) {
            booking.setInternalNotes(request.getInternalNotes());
        }

        if (request.getAddOnIds() != null) {
            booking.getBookingAddOns().clear();
            BigDecimal addOnsTotal = BigDecimal.ZERO;
            for (Long addOnId : request.getAddOnIds()) {
                AddOn addOn = addOnRepository.findById(addOnId)
                        .orElseThrow(() -> new ResourceNotFoundException("AddOn", "id", addOnId));
                BookingAddOn bao = BookingAddOn.builder()
                        .id(new BookingAddOnId(booking.getId(), addOn.getId()))
                        .booking(booking)
                        .addOn(addOn)
                        .unitPrice(addOn.getPrice())
                        .build();
                booking.getBookingAddOns().add(bao);
                addOnsTotal = addOnsTotal.add(addOn.getPrice());
            }
            booking.setAddOnsPrice(addOnsTotal);
        }

        recalculateBookingFinancials(booking);
        Booking updated = bookingRepository.save(booking);
        auditService.log("BOOKING_UPDATE", "Updated booking: " + updated.getBookingRef());
        return mapToResponse(updated);
    }

    @Transactional
    public BookingResponse transitionBookingStatus(Long id, BookingStatusTransitionRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        BookingStatus current = booking.getStatus();
        BookingStatus target = request.getNewStatus();

        if (current == target) {
            return mapToResponse(booking);
        }

        validateStatusTransition(current, target);

        booking.setStatus(target);
        User currentUser = securityUtils.getCurrentUser();

        BookingStatusHistory history = BookingStatusHistory.builder()
                .booking(booking)
                .fromStatus(current)
                .toStatus(target)
                .remarks(request.getRemarks() != null ? request.getRemarks() : "Transitioned to " + target)
                .changedBy(currentUser)
                .build();
        statusHistoryRepository.save(history);

        Booking updated = bookingRepository.save(booking);
        auditService.log("BOOKING_STATUS_CHANGE", "Booking " + updated.getBookingRef() + " changed from " + current + " to " + target);

        notificationService.createNotification(
                booking.getCustomer().getId(),
                "Booking Status Updated (" + booking.getBookingRef() + ")",
                "Your booking status has changed to: " + target,
                "BOOKING",
                "/customer/bookings/" + booking.getId()
        );

        return mapToResponse(updated);
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        validateBookingAccess(booking);

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Completed bookings cannot be cancelled");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        BookingStatus prev = booking.getStatus();
        booking.setStatus(BookingStatus.CANCELLED);

        for (PhotographerAssignment pa : booking.getAssignments()) {
            if (pa.getStatus() != AssignmentStatus.CANCELLED) {
                pa.setStatus(AssignmentStatus.CANCELLED);
            }
        }

        User currentUser = securityUtils.getCurrentUser();
        BookingStatusHistory history = BookingStatusHistory.builder()
                .booking(booking)
                .fromStatus(prev)
                .toStatus(BookingStatus.CANCELLED)
                .remarks("Cancelled: " + (reason != null ? reason : "Requested by user"))
                .changedBy(currentUser)
                .build();
        statusHistoryRepository.save(history);

        Booking updated = bookingRepository.save(booking);
        auditService.log("BOOKING_CANCEL", "Cancelled booking " + updated.getBookingRef());

        notificationService.createNotification(
                booking.getCustomer().getId(),
                "Booking Cancelled (" + booking.getBookingRef() + ")",
                "Your booking has been cancelled.",
                "BOOKING",
                "/customer/bookings/" + booking.getId()
        );

        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<BookingStatusHistoryResponse> getBookingHistory(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        validateBookingAccess(booking);
        return statusHistoryRepository.findByBookingIdOrderByCreatedAtDesc(id).stream()
                .map(this::mapToHistoryResponse)
                .toList();
    }

    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Completed bookings cannot be deleted");
        }

        // Block deletion if verified payments exist (financial record integrity)
        boolean hasVerifiedPayments = booking.getPayments().stream()
                .anyMatch(p -> p.getStatus().name().equals("VERIFIED"));
        if (hasVerifiedPayments) {
            throw new BadRequestException(
                    "This booking has verified payments and cannot be deleted. Use 'Cancel' instead.");
        }

        auditService.log("BOOKING_DELETE", "Hard-deleted booking: " + booking.getBookingRef());
        bookingRepository.delete(booking);
    }

    public void recalculateBookingFinancials(Booking booking) {
        BigDecimal total = booking.getPackagePrice()
                .add(booking.getAddOnsPrice() != null ? booking.getAddOnsPrice() : BigDecimal.ZERO)
                .add(booking.getAdditionalCharges() != null ? booking.getAdditionalCharges() : BigDecimal.ZERO);
        booking.setTotalAmount(total);
        BigDecimal paid = booking.getPaidAmount() != null ? booking.getPaidAmount() : BigDecimal.ZERO;
        booking.setBalanceAmount(total.subtract(paid));
    }

    private void validateStatusTransition(BookingStatus current, BookingStatus target) {
        if (current == BookingStatus.COMPLETED) {
            throw new BadRequestException("Completed bookings cannot transition to another status");
        }
        if (current == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cancelled bookings cannot transition to another status");
        }

        if (target == BookingStatus.CANCELLED) {
            return;
        }

        boolean valid = switch (current) {
            case PENDING -> target == BookingStatus.CONFIRMED;
            case CONFIRMED -> target == BookingStatus.ASSIGNED;
            case ASSIGNED -> target == BookingStatus.IN_PROGRESS;
            case IN_PROGRESS -> target == BookingStatus.COMPLETED;
            default -> false;
        };

        if (!valid) {
            throw new BadRequestException("Invalid booking status transition from " + current + " to " + target);
        }
    }

    public void validateBookingAccess(Booking booking) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !booking.getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You are not authorized to view or modify another customer's booking");
        }
        if (currentUser.getRole() == Role.PHOTOGRAPHER) {
            boolean isAssigned = booking.getAssignments().stream()
                    .anyMatch(a -> a.getPhotographer().getId().equals(currentUser.getId()));
            if (!isAssigned) {
                throw new ForbiddenException("You are not assigned to this event");
            }
        }
    }

    public BookingResponse mapToResponse(Booking b) {
        List<AddOnResponse> addOns = b.getBookingAddOns().stream()
                .map(bao -> AddOnResponse.builder()
                        .id(bao.getAddOn().getId())
                        .name(bao.getAddOn().getName())
                        .description(bao.getAddOn().getDescription())
                        .price(bao.getUnitPrice())
                        .active(bao.getAddOn().isActive())
                        .createdAt(bao.getAddOn().getCreatedAt())
                        .build())
                .toList();

        List<AssignmentResponse> assignments = b.getAssignments().stream()
                .map(a -> AssignmentResponse.builder()
                        .id(a.getId())
                        .bookingId(b.getId())
                        .bookingRef(b.getBookingRef())
                        .eventDate(b.getEventDate())
                        .startTime(b.getStartTime())
                        .endTime(b.getEndTime())
                        .venue(b.getVenue())
                        .packageName(b.getPhotographyPackage().getName())
                        .photographerId(a.getPhotographer().getId())
                        .photographerName(a.getPhotographer().getFullName())
                        .photographerEmail(a.getPhotographer().getEmail())
                        .photographerPhone(a.getPhotographer().getPhone())
                        .status(a.getStatus())
                        .assignedById(a.getAssignedBy().getId())
                        .assignedByName(a.getAssignedBy().getFullName())
                        .notes(a.getNotes())
                        .createdAt(a.getCreatedAt())
                        .build())
                .toList();

        return BookingResponse.builder()
                .id(b.getId())
                .bookingRef(b.getBookingRef())
                .customerId(b.getCustomer().getId())
                .customerName(b.getCustomer().getFullName())
                .customerEmail(b.getCustomer().getEmail())
                .customerPhone(b.getCustomer().getPhone())
                .packageId(b.getPhotographyPackage().getId())
                .packageName(b.getPhotographyPackage().getName())
                .durationHours(b.getPhotographyPackage().getDurationHours())
                .preferredPhotographerId(b.getPreferredPhotographer() != null ? b.getPreferredPhotographer().getId() : null)
                .preferredPhotographerName(b.getPreferredPhotographer() != null ? b.getPreferredPhotographer().getFullName() : null)
                .eventDate(b.getEventDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .venue(b.getVenue())
                .eventType(b.getEventType())
                .specialRequests(b.getSpecialRequests())
                .status(b.getStatus())
                .packagePrice(b.getPackagePrice())
                .addOnsPrice(b.getAddOnsPrice())
                .additionalCharges(b.getAdditionalCharges())
                .totalAmount(b.getTotalAmount())
                .paidAmount(b.getPaidAmount())
                .balanceAmount(b.getBalanceAmount())
                .internalNotes(b.getInternalNotes())
                .addOns(addOns)
                .assignments(assignments)
                .galleryId(b.getGallery() != null ? b.getGallery().getId() : null)
                .galleryAccessCode(b.getGallery() != null ? b.getGallery().getAccessCode() : null)
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }

    public BookingSummaryResponse mapToSummaryResponse(Booking b) {
        return BookingSummaryResponse.builder()
                .id(b.getId())
                .bookingRef(b.getBookingRef())
                .customerName(b.getCustomer().getFullName())
                .customerEmail(b.getCustomer().getEmail())
                .packageName(b.getPhotographyPackage().getName())
                .eventDate(b.getEventDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .venue(b.getVenue())
                .eventType(b.getEventType())
                .status(b.getStatus())
                .totalAmount(b.getTotalAmount())
                .balanceAmount(b.getBalanceAmount())
                .build();
    }

    private BookingStatusHistoryResponse mapToHistoryResponse(BookingStatusHistory h) {
        return BookingStatusHistoryResponse.builder()
                .id(h.getId())
                .bookingId(h.getBooking().getId())
                .fromStatus(h.getFromStatus())
                .toStatus(h.getToStatus())
                .remarks(h.getRemarks())
                .changedById(h.getChangedBy() != null ? h.getChangedBy().getId() : null)
                .changedByName(h.getChangedBy() != null ? h.getChangedBy().getFullName() : "System")
                .createdAt(h.getCreatedAt())
                .build();
    }
}

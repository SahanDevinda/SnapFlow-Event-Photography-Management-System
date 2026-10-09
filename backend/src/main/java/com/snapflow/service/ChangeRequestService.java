package com.snapflow.service;

import com.snapflow.dto.request.ChangeRequestCreateDto;
import com.snapflow.dto.request.ChangeRequestReviewDto;
import com.snapflow.dto.response.AddOnResponse;
import com.snapflow.dto.response.ChangeRequestResponse;
import com.snapflow.entity.Package;
import com.snapflow.entity.*;
import com.snapflow.enums.AssignmentStatus;
import com.snapflow.enums.BookingStatus;
import com.snapflow.enums.ChangeRequestStatus;
import com.snapflow.enums.ChangeRequestType;
import com.snapflow.enums.CrewRole;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ConflictException;
import com.snapflow.exception.ForbiddenException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.*;
import com.snapflow.util.SecurityUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChangeRequestService {

    private final ChangeRequestRepository changeRequestRepository;
    private final BookingRepository bookingRepository;
    private final PackageRepository packageRepository;
    private final AddOnRepository addOnRepository;
    private final PhotographerAssignmentRepository assignmentRepository;
    private final EquipmentAllocationRepository equipmentAllocationRepository;
    private final BookingService bookingService;
    private final SecurityUtils securityUtils;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final EntityManager entityManager;

    private static final ZoneId COLOMBO_ZONE = ZoneId.of("Asia/Colombo");

    @Transactional
    public ChangeRequestResponse createChangeRequest(Long bookingId, ChangeRequestCreateDto dto) {
        Booking booking = lockBooking(bookingId);

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !booking.getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only submit change requests for your own bookings");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot request changes for a " + booking.getStatus() + " booking");
        }

        String description = dto.getDescription() != null ? dto.getDescription().trim() : "";
        if (description.isEmpty()) {
            throw new BadRequestException("Description of change request is required");
        }
        if (description.length() > 2000) {
            throw new BadRequestException("Description cannot exceed 2000 characters");
        }

        ChangeRequestType requestType = dto.getRequestType() != null ? dto.getRequestType() : ChangeRequestType.GENERAL;

        if (requestType == ChangeRequestType.ADDITIONAL_CREW) {
            if (dto.getRequestedCrewRole() == null) {
                throw new BadRequestException("Requested crew role is required for additional crew requests.");
            }
            if (dto.getRequestedCrewRole() == CrewRole.PRIMARY_PHOTOGRAPHER) {
                throw new BadRequestException("Only one Primary Photographer is permitted per booking. If you need an additional photographer, please request a Secondary Photographer.");
            }
            boolean pendingExists = changeRequestRepository.findByBookingIdOrderByCreatedAtDesc(booking.getId()).stream()
                    .anyMatch(r -> r.getStatus() == ChangeRequestStatus.PENDING &&
                                   r.getRequestType() == ChangeRequestType.ADDITIONAL_CREW &&
                                   r.getRequestedCrewRole() == dto.getRequestedCrewRole());
            if (pendingExists) {
                throw new ConflictException("A pending request for " + AssignmentService.getCrewRoleLabel(dto.getRequestedCrewRole()) + " already exists for this booking.");
            }
        }

        LocalDate today = LocalDate.now(COLOMBO_ZONE);
        LocalTime nowTime = LocalTime.now(COLOMBO_ZONE);

        if (dto.getProposedDate() != null) {
            if (dto.getProposedDate().isBefore(today)) {
                throw new BadRequestException("Proposed date cannot be in the past");
            }
            LocalTime startToCheck = dto.getProposedStartTime() != null ? dto.getProposedStartTime() : booking.getStartTime();
            if (dto.getProposedDate().isEqual(today) && startToCheck.isBefore(nowTime)) {
                throw new BadRequestException("Proposed start time cannot be in the past");
            }
        } else if (dto.getProposedStartTime() != null) {
            if (booking.getEventDate().isEqual(today) && dto.getProposedStartTime().isBefore(nowTime)) {
                throw new BadRequestException("Proposed start time cannot be in the past");
            }
        }

        Package proposedPkg = null;
        BigDecimal proposedPkgPrice = booking.getPackagePrice();
        Integer durationHours = booking.getPhotographyPackage().getDurationHours();

        if (dto.getProposedPackageId() != null) {
            proposedPkg = packageRepository.findById(dto.getProposedPackageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Package", "id", dto.getProposedPackageId()));
            if (!proposedPkg.isActive()) {
                throw new BadRequestException("Selected package is not active");
            }
            proposedPkgPrice = proposedPkg.getPrice();
            durationHours = proposedPkg.getDurationHours();
        }

        LocalTime proposedStart = dto.getProposedStartTime() != null ? dto.getProposedStartTime() : booking.getStartTime();
        LocalTime proposedEnd = proposedStart.plusHours(durationHours);

        List<AddOn> requestedAddOns = new ArrayList<>();
        BigDecimal proposedAddOnsTotal = booking.getAddOnsPrice();

        if (dto.getProposedAddOnIds() != null) {
            if (dto.getProposedAddOnIds().size() > 20) {
                throw new BadRequestException("A change request cannot have more than 20 add-ons");
            }
            java.util.Set<Long> uniqueIds = new java.util.HashSet<>(dto.getProposedAddOnIds());
            if (uniqueIds.size() < dto.getProposedAddOnIds().size()) {
                throw new BadRequestException("Duplicate add-ons are not allowed");
            }

            proposedAddOnsTotal = BigDecimal.ZERO;
            for (Long addOnId : dto.getProposedAddOnIds()) {
                AddOn addOn = addOnRepository.findById(addOnId)
                        .orElseThrow(() -> new ResourceNotFoundException("AddOn", "id", addOnId));
                if (!addOn.isActive()) {
                    throw new BadRequestException("AddOn '" + addOn.getName() + "' is not active");
                }
                requestedAddOns.add(addOn);
                proposedAddOnsTotal = proposedAddOnsTotal.add(addOn.getPrice());
            }
        }

        String proposedVenue = dto.getProposedVenue() != null ? dto.getProposedVenue().trim() : null;
        if (proposedVenue != null && proposedVenue.length() > 255) {
            throw new BadRequestException("Proposed venue cannot exceed 255 characters");
        }

        BigDecimal proposedTotal = proposedPkgPrice.add(proposedAddOnsTotal != null ? proposedAddOnsTotal : BigDecimal.ZERO)
                .add(booking.getAdditionalCharges() != null ? booking.getAdditionalCharges() : BigDecimal.ZERO);
        BigDecimal priceDifference = requestType == ChangeRequestType.ADDITIONAL_CREW ? BigDecimal.ZERO : proposedTotal.subtract(booking.getTotalAmount());

        ChangeRequest cr = ChangeRequest.builder()
                .booking(booking)
                .requestType(requestType)
                .requestedCrewRole(dto.getRequestedCrewRole())
                .quantity(dto.getQuantity() != null && dto.getQuantity() > 0 ? dto.getQuantity() : 1)
                .proposedPackage(proposedPkg)
                .proposedDate(dto.getProposedDate())
                .proposedStartTime(dto.getProposedStartTime())
                .proposedEndTime(dto.getProposedStartTime() != null ? proposedEnd : null)
                .proposedVenue(proposedVenue)
                .description(description)
                .priceDifference(priceDifference)
                .status(ChangeRequestStatus.PENDING)
                .requestedAddOns(requestedAddOns)
                .build();

        ChangeRequest saved = changeRequestRepository.save(cr);
        if (requestType == ChangeRequestType.ADDITIONAL_CREW) {
            auditService.log("CREW_REQUEST_CREATED", "Requested additional crew " + dto.getRequestedCrewRole() + " for " + booking.getBookingRef());
        } else {
            auditService.log("CHANGE_REQUEST_CREATED", "Change request #" + saved.getId() + " created for " + booking.getBookingRef());
        }

        return mapToResponse(saved);
    }

    @Transactional
    public ChangeRequestResponse updatePendingChangeRequest(Long requestId, ChangeRequestCreateDto dto) {
        ChangeRequest cr = changeRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("ChangeRequest", "id", requestId));

        Booking booking = lockBooking(cr.getBooking().getId());
        entityManager.refresh(cr, LockModeType.PESSIMISTIC_WRITE);

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !cr.getBooking().getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only modify your own change requests");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot edit change requests for a " + booking.getStatus() + " booking");
        }

        if (cr.getStatus() != ChangeRequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING change requests can be edited");
        }

        String description = dto.getDescription() != null ? dto.getDescription().trim() : "";
        if (description.isEmpty()) {
            throw new BadRequestException("Description of change request is required");
        }
        if (description.length() > 2000) {
            throw new BadRequestException("Description cannot exceed 2000 characters");
        }
        cr.setDescription(description);

        LocalDate today = LocalDate.now(COLOMBO_ZONE);
        LocalTime nowTime = LocalTime.now(COLOMBO_ZONE);

        if (dto.getProposedDate() != null) {
            if (dto.getProposedDate().isBefore(today)) {
                throw new BadRequestException("Proposed date cannot be in the past");
            }
            LocalTime startToCheck = dto.getProposedStartTime() != null ? dto.getProposedStartTime() :
                    (cr.getProposedStartTime() != null ? cr.getProposedStartTime() : booking.getStartTime());
            if (dto.getProposedDate().isEqual(today) && startToCheck.isBefore(nowTime)) {
                throw new BadRequestException("Proposed start time cannot be in the past");
            }
            cr.setProposedDate(dto.getProposedDate());
        }

        Package pkg = cr.getProposedPackage();
        if (dto.getProposedPackageId() != null) {
            pkg = packageRepository.findById(dto.getProposedPackageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Package", "id", dto.getProposedPackageId()));
            if (!pkg.isActive()) {
                throw new BadRequestException("Selected package is not active");
            }
            cr.setProposedPackage(pkg);
        }

        if (dto.getProposedStartTime() != null) {
            LocalDate dateToCheck = cr.getProposedDate() != null ? cr.getProposedDate() : booking.getEventDate();
            if (dateToCheck.isEqual(today) && dto.getProposedStartTime().isBefore(nowTime)) {
                throw new BadRequestException("Proposed start time cannot be in the past");
            }
            cr.setProposedStartTime(dto.getProposedStartTime());
            int dur = pkg != null ? pkg.getDurationHours() : booking.getPhotographyPackage().getDurationHours();
            cr.setProposedEndTime(dto.getProposedStartTime().plusHours(dur));
        }

        if (dto.getProposedVenue() != null) {
            String venue = dto.getProposedVenue().trim();
            if (venue.length() > 255) {
                throw new BadRequestException("Proposed venue cannot exceed 255 characters");
            }
            cr.setProposedVenue(venue);
        }

        if (dto.getProposedAddOnIds() != null) {
            if (dto.getProposedAddOnIds().size() > 20) {
                throw new BadRequestException("A change request cannot have more than 20 add-ons");
            }
            java.util.Set<Long> uniqueIds = new java.util.HashSet<>(dto.getProposedAddOnIds());
            if (uniqueIds.size() < dto.getProposedAddOnIds().size()) {
                throw new BadRequestException("Duplicate add-ons are not allowed");
            }

            List<AddOn> requestedAddOns = new ArrayList<>();
            for (Long addOnId : dto.getProposedAddOnIds()) {
                AddOn addOn = addOnRepository.findById(addOnId)
                        .orElseThrow(() -> new ResourceNotFoundException("AddOn", "id", addOnId));
                if (!addOn.isActive()) {
                    throw new BadRequestException("AddOn '" + addOn.getName() + "' is not active");
                }
                requestedAddOns.add(addOn);
            }
            cr.setRequestedAddOns(requestedAddOns);
        }

        // Recalculate price difference
        BigDecimal pkgPrice = cr.getProposedPackage() != null ? cr.getProposedPackage().getPrice() : booking.getPackagePrice();
        BigDecimal addOnsTotal = BigDecimal.ZERO;
        if (cr.getRequestedAddOns() != null && !cr.getRequestedAddOns().isEmpty()) {
            for (AddOn a : cr.getRequestedAddOns()) {
                addOnsTotal = addOnsTotal.add(a.getPrice());
            }
        } else {
            addOnsTotal = booking.getAddOnsPrice() != null ? booking.getAddOnsPrice() : BigDecimal.ZERO;
        }
        BigDecimal proposedTotal = pkgPrice.add(addOnsTotal)
                .add(booking.getAdditionalCharges() != null ? booking.getAdditionalCharges() : BigDecimal.ZERO);
        cr.setPriceDifference(proposedTotal.subtract(booking.getTotalAmount()));

        ChangeRequest updated = changeRequestRepository.save(cr);
        auditService.log("CHANGE_REQUEST_EDITED", "Edited change request #" + updated.getId());
        return mapToResponse(updated);
    }

    @Transactional
    public void deletePendingChangeRequest(Long requestId) {
        ChangeRequest cr = changeRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("ChangeRequest", "id", requestId));

        Booking booking = lockBooking(cr.getBooking().getId());
        entityManager.refresh(cr, LockModeType.PESSIMISTIC_WRITE);

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !cr.getBooking().getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only delete your own change requests");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Change request history for a cancelled booking must be preserved");
        }

        if (cr.getStatus() != ChangeRequestStatus.PENDING) {
            throw new BadRequestException("Only pending change requests can be deleted. Reviewed requests must be preserved for history.");
        }

        changeRequestRepository.delete(cr);
        auditService.log("CHANGE_REQUEST_DELETED", "Deleted change request #" + requestId);
    }

    @Transactional
    public ChangeRequestResponse reviewChangeRequest(Long requestId, ChangeRequestReviewDto dto) {
        ChangeRequest cr = changeRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("ChangeRequest", "id", requestId));

        Booking booking = lockBooking(cr.getBooking().getId());
        entityManager.refresh(cr, LockModeType.PESSIMISTIC_WRITE);

        if (cr.getStatus() != ChangeRequestStatus.PENDING) {
            throw new BadRequestException("This request has already been reviewed");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot review change request for a " + booking.getStatus() + " booking");
        }

        User reviewer = securityUtils.getCurrentUser();
        cr.setStatus(dto.getStatus());
        cr.setReviewedBy(reviewer);
        cr.setReviewNotes(dto.getReviewNotes() != null ? dto.getReviewNotes().trim() : null);
        cr.setReviewedAt(LocalDateTime.now());

        if (dto.getStatus() == ChangeRequestStatus.APPROVED) {
            // Check proposed package active
            if (cr.getProposedPackage() != null && !cr.getProposedPackage().isActive()) {
                throw new BadRequestException("Cannot approve: Proposed package is no longer active");
            }

            // Check proposed add-ons active
            for (AddOn a : cr.getRequestedAddOns()) {
                if (!a.isActive()) {
                    throw new BadRequestException("Cannot approve: Requested add-on '" + a.getName() + "' is no longer active");
                }
            }

            // Recheck photographer and equipment availability if date or time changed
            if (cr.getProposedDate() != null || cr.getProposedStartTime() != null) {
                var newDate = cr.getProposedDate() != null ? cr.getProposedDate() : booking.getEventDate();
                var newStart = cr.getProposedStartTime() != null ? cr.getProposedStartTime() : booking.getStartTime();
                var newEnd = cr.getProposedEndTime() != null ? cr.getProposedEndTime() : booking.getEndTime();

                if (booking.getAssignments() != null) {
                    for (PhotographerAssignment pa : booking.getAssignments()) {
                        if (pa.getStatus() != AssignmentStatus.CANCELLED) {
                            var conflicts = assignmentRepository.findConflictingAssignments(
                                    pa.getPhotographer().getId(), newDate, newStart, newEnd, booking.getId()
                            );
                            if (!conflicts.isEmpty()) {
                                throw new BadRequestException("Cannot approve: Assigned photographer "
                                        + pa.getPhotographer().getFullName()
                                        + " has a scheduling conflict for the proposed date/time");
                            }
                        }
                    }
                }

                List<EquipmentAllocation> allocations = equipmentAllocationRepository.findByBookingId(booking.getId());
                for (EquipmentAllocation ea : allocations) {
                    if (ea.getReturnedAt() == null) {
                        var conflicts = equipmentAllocationRepository.findConflictingAllocations(
                                ea.getEquipment().getId(), newDate, newStart, newEnd, booking.getId()
                        );
                        if (!conflicts.isEmpty()) {
                            throw new BadRequestException("Cannot approve: Allocated equipment '"
                                    + ea.getEquipment().getName()
                                    + "' has a scheduling conflict for the proposed date/time");
                        }
                    }
                }

                booking.setEventDate(newDate);
                booking.setStartTime(newStart);
                booking.setEndTime(newEnd);
            }

            if (cr.getProposedVenue() != null && !cr.getProposedVenue().isBlank()) {
                booking.setVenue(cr.getProposedVenue().trim());
            }

            if (cr.getProposedPackage() != null) {
                booking.setPhotographyPackage(cr.getProposedPackage());
                booking.setPackagePrice(cr.getProposedPackage().getPrice());
                booking.setEndTime(booking.getStartTime().plusHours(cr.getProposedPackage().getDurationHours()));
            }

            if (cr.getRequestedAddOns() != null && !cr.getRequestedAddOns().isEmpty()) {
                booking.getBookingAddOns().clear();
                BigDecimal addOnsTotal = BigDecimal.ZERO;
                for (AddOn a : cr.getRequestedAddOns()) {
                    BookingAddOn bao = BookingAddOn.builder()
                            .id(new BookingAddOnId(booking.getId(), a.getId()))
                            .booking(booking)
                            .addOn(a)
                            .unitPrice(a.getPrice())
                            .build();
                    booking.getBookingAddOns().add(bao);
                    addOnsTotal = addOnsTotal.add(a.getPrice());
                }
                booking.setAddOnsPrice(addOnsTotal);
            }

            bookingService.recalculateBookingFinancials(booking);
            bookingRepository.save(booking);

            if (cr.getRequestType() == ChangeRequestType.ADDITIONAL_CREW) {
                auditService.log("CREW_REQUEST_APPROVED",
                        "Approved crew request #" + cr.getId() + " (" + cr.getRequestedCrewRole() + ") for " + booking.getBookingRef());

                notificationService.createNotification(
                        booking.getCustomer().getId(),
                        "Crew Request Approved (" + booking.getBookingRef() + ")",
                        "Your request for an additional " + AssignmentService.getCrewRoleLabel(cr.getRequestedCrewRole()) + " has been approved.",
                        "CHANGE_REQUEST",
                        "/customer/bookings/" + booking.getId()
                );
            } else {
                auditService.log("CHANGE_REQUEST_APPROVED",
                        "Approved change request #" + cr.getId() + " and updated booking " + booking.getBookingRef());

                notificationService.createNotification(
                        booking.getCustomer().getId(),
                        "Change Request Approved (" + booking.getBookingRef() + ")",
                        "Your change request has been approved and applied to your booking.",
                        "CHANGE_REQUEST",
                        "/customer/bookings/" + booking.getId()
                );
            }
        } else {
            if (cr.getRequestType() == ChangeRequestType.ADDITIONAL_CREW) {
                auditService.log("CREW_REQUEST_REJECTED",
                        "Rejected crew request #" + cr.getId() + " (" + cr.getRequestedCrewRole() + ") for " + booking.getBookingRef());

                notificationService.createNotification(
                        booking.getCustomer().getId(),
                        "Crew Request Rejected (" + booking.getBookingRef() + ")",
                        "Your request for an additional " + AssignmentService.getCrewRoleLabel(cr.getRequestedCrewRole()) + " was not approved. Notes: " + (dto.getReviewNotes() != null ? dto.getReviewNotes() : "No notes provided"),
                        "CHANGE_REQUEST",
                        "/customer/bookings/" + booking.getId()
                );
            } else {
                auditService.log("CHANGE_REQUEST_REJECTED",
                        "Rejected change request #" + cr.getId() + " for " + booking.getBookingRef());

                notificationService.createNotification(
                        booking.getCustomer().getId(),
                        "Change Request Rejected (" + booking.getBookingRef() + ")",
                        "Your change request was not approved. Notes: " + (dto.getReviewNotes() != null ? dto.getReviewNotes() : "No notes provided"),
                        "CHANGE_REQUEST",
                        "/customer/bookings/" + booking.getId()
                );
            }
        }

        ChangeRequest saved = changeRequestRepository.save(cr);
        return mapToResponse(saved);
    }

    private Booking lockBooking(Long bookingId) {
        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        // Preserve prior service changes when joining an existing transaction.
        entityManager.flush();
        entityManager.refresh(booking, LockModeType.PESSIMISTIC_WRITE);
        return booking;
    }

    @Transactional(readOnly = true)
    public Page<ChangeRequestResponse> getChangeRequestsByStatus(ChangeRequestStatus status, Pageable pageable) {
        return changeRequestRepository.findByStatus(status, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<ChangeRequestResponse> getBookingChangeRequests(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !booking.getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You are not authorized to view change requests for this booking");
        }

        return changeRequestRepository.findByBookingIdOrderByCreatedAtDesc(bookingId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChangeRequestResponse getChangeRequestById(Long id) {
        ChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ChangeRequest", "id", id));

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !cr.getBooking().getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You are not authorized to view this change request");
        }

        return mapToResponse(cr);
    }

    @Transactional(readOnly = true)
    public List<ChangeRequestResponse> getMyChangeRequests() {
        Long customerId = securityUtils.getCurrentUserId();
        return changeRequestRepository.findByBookingCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ChangeRequestResponse mapToResponse(ChangeRequest cr) {
        List<AddOnResponse> addOns = cr.getRequestedAddOns().stream()
                .map(a -> AddOnResponse.builder()
                        .id(a.getId())
                        .name(a.getName())
                        .description(a.getDescription())
                        .price(a.getPrice())
                        .active(a.isActive())
                        .createdAt(a.getCreatedAt())
                        .build())
                .toList();

        return ChangeRequestResponse.builder()
                .id(cr.getId())
                .bookingId(cr.getBooking().getId())
                .bookingRef(cr.getBooking().getBookingRef())
                .requestType(cr.getRequestType())
                .requestedCrewRole(cr.getRequestedCrewRole())
                .requestedCrewRoleLabel(cr.getRequestedCrewRole() != null ? AssignmentService.getCrewRoleLabel(cr.getRequestedCrewRole()) : null)
                .quantity(cr.getQuantity())
                .proposedPackageId(cr.getProposedPackage() != null ? cr.getProposedPackage().getId() : null)
                .proposedPackageName(cr.getProposedPackage() != null ? cr.getProposedPackage().getName() : null)
                .proposedDate(cr.getProposedDate())
                .proposedStartTime(cr.getProposedStartTime())
                .proposedEndTime(cr.getProposedEndTime())
                .proposedVenue(cr.getProposedVenue())
                .description(cr.getDescription())
                .priceDifference(cr.getPriceDifference())
                .status(cr.getStatus())
                .reviewedById(cr.getReviewedBy() != null ? cr.getReviewedBy().getId() : null)
                .reviewedByName(cr.getReviewedBy() != null ? cr.getReviewedBy().getFullName() : null)
                .reviewNotes(cr.getReviewNotes())
                .reviewedAt(cr.getReviewedAt())
                .requestedAddOns(addOns)
                .createdAt(cr.getCreatedAt())
                .build();
    }
}

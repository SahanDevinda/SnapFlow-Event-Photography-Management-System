package com.snapflow.service;

import com.snapflow.dto.request.ChangeRequestCreateDto;
import com.snapflow.dto.request.ChangeRequestReviewDto;
import com.snapflow.dto.response.AddOnResponse;
import com.snapflow.dto.response.ChangeRequestResponse;
import com.snapflow.entity.Package;
import com.snapflow.entity.*;
import com.snapflow.enums.BookingStatus;
import com.snapflow.enums.ChangeRequestStatus;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ForbiddenException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.*;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private final BookingService bookingService;
    private final SecurityUtils securityUtils;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    public ChangeRequestResponse createChangeRequest(Long bookingId, ChangeRequestCreateDto dto) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !booking.getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only submit change requests for your own bookings");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot request changes for a " + booking.getStatus() + " booking");
        }

        Package proposedPkg = null;
        BigDecimal proposedPkgPrice = booking.getPackagePrice();
        Integer durationHours = booking.getPhotographyPackage().getDurationHours();

        if (dto.getProposedPackageId() != null) {
            proposedPkg = packageRepository.findById(dto.getProposedPackageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Package", "id", dto.getProposedPackageId()));
            proposedPkgPrice = proposedPkg.getPrice();
            durationHours = proposedPkg.getDurationHours();
        }

        LocalTime proposedStart = dto.getProposedStartTime() != null ? dto.getProposedStartTime() : booking.getStartTime();
        LocalTime proposedEnd = proposedStart.plusHours(durationHours);

        List<AddOn> requestedAddOns = new ArrayList<>();
        BigDecimal proposedAddOnsTotal = booking.getAddOnsPrice();

        if (dto.getProposedAddOnIds() != null) {
            proposedAddOnsTotal = BigDecimal.ZERO;
            for (Long addOnId : dto.getProposedAddOnIds()) {
                AddOn addOn = addOnRepository.findById(addOnId)
                        .orElseThrow(() -> new ResourceNotFoundException("AddOn", "id", addOnId));
                requestedAddOns.add(addOn);
                proposedAddOnsTotal = proposedAddOnsTotal.add(addOn.getPrice());
            }
        }

        BigDecimal proposedTotal = proposedPkgPrice.add(proposedAddOnsTotal).add(booking.getAdditionalCharges());
        BigDecimal priceDifference = proposedTotal.subtract(booking.getTotalAmount());

        ChangeRequest cr = ChangeRequest.builder()
                .booking(booking)
                .proposedPackage(proposedPkg)
                .proposedDate(dto.getProposedDate())
                .proposedStartTime(dto.getProposedStartTime())
                .proposedEndTime(dto.getProposedStartTime() != null ? proposedEnd : null)
                .proposedVenue(dto.getProposedVenue())
                .description(dto.getDescription().trim())
                .priceDifference(priceDifference)
                .status(ChangeRequestStatus.PENDING)
                .requestedAddOns(requestedAddOns)
                .build();

        ChangeRequest saved = changeRequestRepository.save(cr);
        auditService.log("CHANGE_REQUEST_CREATED", "Change request #" + saved.getId() + " created for " + booking.getBookingRef());

        return mapToResponse(saved);
    }

    @Transactional
    public ChangeRequestResponse updatePendingChangeRequest(Long requestId, ChangeRequestCreateDto dto) {
        ChangeRequest cr = changeRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("ChangeRequest", "id", requestId));

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !cr.getBooking().getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only modify your own change requests");
        }

        if (cr.getStatus() != ChangeRequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING change requests can be edited");
        }

        cr.setDescription(dto.getDescription().trim());
        if (dto.getProposedPackageId() != null) {
            Package pkg = packageRepository.findById(dto.getProposedPackageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Package", "id", dto.getProposedPackageId()));
            cr.setProposedPackage(pkg);
        }
        if (dto.getProposedDate() != null) {
            cr.setProposedDate(dto.getProposedDate());
        }
        if (dto.getProposedStartTime() != null) {
            cr.setProposedStartTime(dto.getProposedStartTime());
            int dur = cr.getProposedPackage() != null
                    ? cr.getProposedPackage().getDurationHours()
                    : cr.getBooking().getPhotographyPackage().getDurationHours();
            cr.setProposedEndTime(dto.getProposedStartTime().plusHours(dur));
        }
        if (dto.getProposedVenue() != null) {
            cr.setProposedVenue(dto.getProposedVenue());
        }

        ChangeRequest updated = changeRequestRepository.save(cr);
        auditService.log("CHANGE_REQUEST_EDITED", "Edited change request #" + updated.getId());
        return mapToResponse(updated);
    }

    @Transactional
    public void deletePendingChangeRequest(Long requestId) {
        ChangeRequest cr = changeRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("ChangeRequest", "id", requestId));

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !cr.getBooking().getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only delete your own change requests");
        }

        if (cr.getStatus() != ChangeRequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING change requests can be deleted");
        }

        changeRequestRepository.delete(cr);
        auditService.log("CHANGE_REQUEST_DELETED", "Deleted change request #" + requestId);
    }

    @Transactional
    public ChangeRequestResponse reviewChangeRequest(Long requestId, ChangeRequestReviewDto dto) {
        ChangeRequest cr = changeRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("ChangeRequest", "id", requestId));

        if (cr.getStatus() != ChangeRequestStatus.PENDING) {
            throw new BadRequestException("This request has already been reviewed");
        }

        User reviewer = securityUtils.getCurrentUser();
        cr.setStatus(dto.getStatus());
        cr.setReviewedBy(reviewer);
        cr.setReviewNotes(dto.getReviewNotes());
        cr.setReviewedAt(LocalDateTime.now());

        Booking booking = cr.getBooking();

        if (dto.getStatus() == ChangeRequestStatus.APPROVED) {
            // Recheck photographer availability if date or time changed
            if (cr.getProposedDate() != null || cr.getProposedStartTime() != null) {
                var newDate = cr.getProposedDate() != null ? cr.getProposedDate() : booking.getEventDate();
                var newStart = cr.getProposedStartTime() != null ? cr.getProposedStartTime() : booking.getStartTime();
                var newEnd = cr.getProposedEndTime() != null ? cr.getProposedEndTime() : booking.getEndTime();

                for (PhotographerAssignment pa : booking.getAssignments()) {
                    var conflicts = assignmentRepository.findConflictingAssignments(
                            pa.getPhotographer().getId(), newDate, newStart, newEnd, booking.getId()
                    );
                    if (!conflicts.isEmpty()) {
                        throw new BadRequestException("Cannot approve: Assigned photographer has a scheduling conflict for the proposed date/time");
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

            if (!cr.getRequestedAddOns().isEmpty()) {
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

            auditService.log("CHANGE_REQUEST_APPROVED",
                    "Approved change request #" + cr.getId() + " and updated booking " + booking.getBookingRef());

            notificationService.createNotification(
                    booking.getCustomer().getId(),
                    "Change Request Approved (" + booking.getBookingRef() + ")",
                    "Your change request has been approved and applied to your booking.",
                    "CHANGE_REQUEST",
                    "/customer/bookings/" + booking.getId()
            );
        } else {
            auditService.log("CHANGE_REQUEST_REJECTED",
                    "Rejected change request #" + cr.getId() + " for " + booking.getBookingRef());

            notificationService.createNotification(
                    booking.getCustomer().getId(),
                    "Change Request Rejected (" + booking.getBookingRef() + ")",
                    "Your change request was not approved. Notes: " + dto.getReviewNotes(),
                    "CHANGE_REQUEST",
                    "/customer/bookings/" + booking.getId()
            );
        }

        ChangeRequest saved = changeRequestRepository.save(cr);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ChangeRequestResponse> getChangeRequestsByStatus(ChangeRequestStatus status, Pageable pageable) {
        return changeRequestRepository.findByStatus(status, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<ChangeRequestResponse> getBookingChangeRequests(Long bookingId) {
        return changeRequestRepository.findByBookingIdOrderByCreatedAtDesc(bookingId).stream()
                .map(this::mapToResponse)
                .toList();
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

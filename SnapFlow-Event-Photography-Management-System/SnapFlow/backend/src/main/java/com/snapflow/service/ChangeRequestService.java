package com.snapflow.service;

import com.snapflow.enums.ChangeRequestStatus;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.ChangeRequestRepository;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChangeRequestService {

    private final ChangeRequestRepository changeRequestRepository;
    private final BookingService bookingService;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    @Transactional
    public ChangeRequestResponse create(ChangeRequestDto dto) {
        User current = securityUtils.getCurrentUser();
        Booking booking = bookingService.getEntityById(dto.getBookingId());

        // Customer can only request on their own bookings
        if (current.getRole().name().equals("CUSTOMER")
                && !booking.getCustomer().getId().equals(current.getId())) {
            throw new BadRequestException("You can only request changes on your own bookings");
        }

        ChangeRequest cr = ChangeRequest.builder()
                .booking(booking)
                .requestedBy(current)
                .requestType(dto.getRequestType())
                .description(dto.getDescription())
                .status(ChangeRequestStatus.PENDING)
                .build();

        cr = changeRequestRepository.save(cr);

        notificationService.notify(current.getId(), "Change Request Submitted",
                "Your change request for booking " + booking.getBookingRef() + " has been submitted.",
                "CHANGE_REQUEST", "CHANGE_REQUEST", cr.getId());

        activityLogService.log(current.getId(), "CREATE_CHANGE_REQUEST", "CHANGE_REQUEST", cr.getId(),
                dto.getRequestType() + " for " + booking.getBookingRef());

        return toResponse(cr);
    }

    @Transactional
    public ChangeRequestResponse review(Long id, ReviewChangeRequest review) {
        ChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Change request not found"));

        if (cr.getStatus() != ChangeRequestStatus.PENDING) {
            throw new BadRequestException("This change request has already been reviewed");
        }

        User reviewer = securityUtils.getCurrentUser();
        cr.setReviewedBy(reviewer);
        cr.setReviewNotes(review.getReviewNotes());
        cr.setStatus(Boolean.TRUE.equals(review.getApproved())
                ? ChangeRequestStatus.APPROVED
                : ChangeRequestStatus.REJECTED);

        cr = changeRequestRepository.save(cr);

        String result = cr.getStatus().name();
        notificationService.notify(cr.getRequestedBy().getId(), "Change Request " + result,
                "Your change request for " + cr.getBooking().getBookingRef() + " has been " + result.toLowerCase() + ".",
                "CHANGE_REQUEST", "CHANGE_REQUEST", cr.getId());

        activityLogService.log(reviewer.getId(), "REVIEW_CHANGE_REQUEST", "CHANGE_REQUEST", id, result);

        return toResponse(cr);
    }

    public List<ChangeRequestResponse> getPending() {
        return changeRequestRepository.findByStatusOrderByCreatedAtDesc(ChangeRequestStatus.PENDING).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ChangeRequestResponse> getByBooking(Long bookingId) {
        return changeRequestRepository.findByBookingId(bookingId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ChangeRequestResponse> getMyRequests() {
        Long userId = securityUtils.getCurrentUserId();
        return changeRequestRepository.findByRequestedById(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ChangeRequestResponse toResponse(ChangeRequest cr) {
        return ChangeRequestResponse.builder()
                .id(cr.getId())
                .bookingId(cr.getBooking().getId())
                .bookingRef(cr.getBooking().getBookingRef())
                .requestedById(cr.getRequestedBy().getId())
                .requestedByName(cr.getRequestedBy().getFullName())
                .requestType(cr.getRequestType())
                .description(cr.getDescription())
                .status(cr.getStatus())
                .reviewedById(cr.getReviewedBy() != null ? cr.getReviewedBy().getId() : null)
                .reviewedByName(cr.getReviewedBy() != null ? cr.getReviewedBy().getFullName() : null)
                .reviewNotes(cr.getReviewNotes())
                .createdAt(cr.getCreatedAt())
                .updatedAt(cr.getUpdatedAt())
                .build();
    }
}

package com.snapflow.service;

import com.snapflow.dto.request.AssignmentCreateRequest;
import com.snapflow.dto.request.AssignmentStatusUpdateRequest;
import com.snapflow.dto.response.AssignmentResponse;
import com.snapflow.dto.response.AssignmentStatusHistoryResponse;
import com.snapflow.entity.AssignmentStatusHistory;
import com.snapflow.entity.Booking;
import com.snapflow.entity.PhotographerAssignment;
import com.snapflow.entity.User;
import com.snapflow.enums.AssignmentStatus;
import com.snapflow.enums.BookingStatus;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ConflictException;
import com.snapflow.exception.ForbiddenException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.AssignmentStatusHistoryRepository;
import com.snapflow.repository.BookingRepository;
import com.snapflow.repository.PhotographerAssignmentRepository;
import com.snapflow.repository.UserRepository;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final PhotographerAssignmentRepository assignmentRepository;
    private final AssignmentStatusHistoryRepository historyRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    public AssignmentResponse assignPhotographer(AssignmentCreateRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot assign photographer to a " + booking.getStatus() + " booking");
        }

        User photographer = userRepository.findById(request.getPhotographerId())
                .orElseThrow(() -> new ResourceNotFoundException("Photographer", "id", request.getPhotographerId()));

        if (photographer.getRole() != Role.PHOTOGRAPHER || !photographer.isActive()) {
            throw new BadRequestException("Selected user is not an active photographer");
        }

        List<PhotographerAssignment> conflicts = assignmentRepository.findConflictingAssignments(
                photographer.getId(), booking.getEventDate(), booking.getStartTime(), booking.getEndTime(), booking.getId()
        );

        if (!conflicts.isEmpty()) {
            PhotographerAssignment conflict = conflicts.get(0);
            throw new ConflictException(String.format(
                    "Photographer %s is already assigned to event %s on %s between %s and %s",
                    photographer.getFullName(),
                    conflict.getBooking().getBookingRef(),
                    conflict.getBooking().getEventDate(),
                    conflict.getBooking().getStartTime(),
                    conflict.getBooking().getEndTime()
            ));
        }

        User assignedBy = securityUtils.getCurrentUser();

        PhotographerAssignment assignment = PhotographerAssignment.builder()
                .booking(booking)
                .photographer(photographer)
                .status(AssignmentStatus.ASSIGNED)
                .assignedBy(assignedBy)
                .notes(request.getNotes())
                .build();

        PhotographerAssignment saved = assignmentRepository.save(assignment);

        AssignmentStatusHistory history = AssignmentStatusHistory.builder()
                .assignment(saved)
                .fromStatus(null)
                .toStatus(AssignmentStatus.ASSIGNED)
                .remarks("Assigned to event")
                .changedBy(assignedBy)
                .build();
        historyRepository.save(history);

        if (booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.CONFIRMED) {
            booking.setStatus(BookingStatus.ASSIGNED);
            bookingRepository.save(booking);
        }

        auditService.log("PHOTOGRAPHER_ASSIGNED",
                "Assigned " + photographer.getFullName() + " to booking " + booking.getBookingRef());

        notificationService.createNotification(
                photographer.getId(),
                "New Event Assigned (" + booking.getBookingRef() + ")",
                "You have been assigned to cover " + booking.getEventType() + " on " + booking.getEventDate(),
                "ASSIGNMENT",
                "/photographer/assignments/" + saved.getId()
        );

        return mapToResponse(saved);
    }

    @Transactional
    public AssignmentResponse updateAssignmentStatus(Long assignmentId, AssignmentStatusUpdateRequest request) {
        PhotographerAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", assignmentId));

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.PHOTOGRAPHER && !assignment.getPhotographer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only update your own assignments");
        }

        AssignmentStatus current = assignment.getStatus();
        AssignmentStatus target = request.getNewStatus();

        if (current == target) {
            return mapToResponse(assignment);
        }

        if (currentUser.getRole() == Role.PHOTOGRAPHER) {
            boolean valid = switch (current) {
                case ASSIGNED -> target == AssignmentStatus.CONFIRMED;
                case CONFIRMED -> target == AssignmentStatus.IN_PROGRESS;
                case IN_PROGRESS -> target == AssignmentStatus.COMPLETED;
                default -> false;
            };
            if (!valid) {
                throw new BadRequestException("Invalid transition from " + current + " to " + target);
            }
        }

        assignment.setStatus(target);

        AssignmentStatusHistory history = AssignmentStatusHistory.builder()
                .assignment(assignment)
                .fromStatus(current)
                .toStatus(target)
                .remarks(request.getRemarks() != null ? request.getRemarks() : "Status updated to " + target)
                .changedBy(currentUser)
                .build();
        historyRepository.save(history);

        Booking booking = assignment.getBooking();
        if (target == AssignmentStatus.IN_PROGRESS && booking.getStatus() == BookingStatus.ASSIGNED) {
            booking.setStatus(BookingStatus.IN_PROGRESS);
            bookingRepository.save(booking);
        } else if (target == AssignmentStatus.COMPLETED && booking.getStatus() == BookingStatus.IN_PROGRESS) {
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);
        }

        PhotographerAssignment updated = assignmentRepository.save(assignment);
        auditService.log("ASSIGNMENT_STATUS_UPDATE",
                "Assignment for " + assignment.getPhotographer().getFullName() + " transitioned to " + target);

        return mapToResponse(updated);
    }

    @Transactional
    public void cancelAssignment(Long assignmentId, String reason) {
        PhotographerAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", assignmentId));

        AssignmentStatus prev = assignment.getStatus();
        assignment.setStatus(AssignmentStatus.CANCELLED);

        User currentUser = securityUtils.getCurrentUser();
        AssignmentStatusHistory history = AssignmentStatusHistory.builder()
                .assignment(assignment)
                .fromStatus(prev)
                .toStatus(AssignmentStatus.CANCELLED)
                .remarks("Assignment cancelled: " + (reason != null ? reason : "Reassigned or cancelled"))
                .changedBy(currentUser)
                .build();
        historyRepository.save(history);

        assignmentRepository.save(assignment);
        auditService.log("ASSIGNMENT_CANCELLED", "Cancelled assignment " + assignmentId);
    }

    @Transactional(readOnly = true)
    public Page<AssignmentResponse> getMyAssignments(Pageable pageable) {
        Long photographerId = securityUtils.getCurrentUserId();
        return assignmentRepository.findByPhotographerId(photographerId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getBookingAssignments(Long bookingId) {
        return assignmentRepository.findByBookingId(bookingId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AssignmentResponse getAssignmentById(Long id) {
        PhotographerAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", id));
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.PHOTOGRAPHER && !assignment.getPhotographer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You are not authorized to view this assignment");
        }
        return mapToResponse(assignment);
    }

    @Transactional(readOnly = true)
    public List<AssignmentStatusHistoryResponse> getAssignmentHistory(Long assignmentId) {
        return historyRepository.findByAssignmentIdOrderByCreatedAtDesc(assignmentId).stream()
                .map(h -> AssignmentStatusHistoryResponse.builder()
                        .id(h.getId())
                        .assignmentId(h.getAssignment().getId())
                        .fromStatus(h.getFromStatus())
                        .toStatus(h.getToStatus())
                        .remarks(h.getRemarks())
                        .changedById(h.getChangedBy() != null ? h.getChangedBy().getId() : null)
                        .changedByName(h.getChangedBy() != null ? h.getChangedBy().getFullName() : "System")
                        .createdAt(h.getCreatedAt())
                        .build())
                .toList();
    }

    public AssignmentResponse mapToResponse(PhotographerAssignment a) {
        Booking b = a.getBooking();
        return AssignmentResponse.builder()
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
                .build();
    }
}

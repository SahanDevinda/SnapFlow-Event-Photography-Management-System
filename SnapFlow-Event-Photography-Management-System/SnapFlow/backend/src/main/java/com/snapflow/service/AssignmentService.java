package com.snapflow.service;

import com.snapflow.enums.AssignmentStatus;
import com.snapflow.enums.BookingStatus;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ConflictException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.PhotographerAssignmentRepository;
import com.snapflow.repository.UserRepository;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final PhotographerAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final BookingService bookingService;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    @Transactional
    public AssignmentResponse assignPhotographer(AssignmentRequest request) {
        Booking booking = bookingService.getEntityById(request.getBookingId());
        User photographer = userRepository.findById(request.getPhotographerId())
                .orElseThrow(() -> new ResourceNotFoundException("Photographer not found"));

        if (photographer.getRole() != Role.PHOTOGRAPHER) {
            throw new BadRequestException("Selected user is not a photographer");
        }

        // Conflict detection – prevent double booking
        if (assignmentRepository.existsConflict(photographer.getId(), booking.getEventDate())) {
            throw new ConflictException(
                    "Photographer " + photographer.getFullName() +
                    " is already assigned to another event on " + booking.getEventDate());
        }

        // Check if already assigned to this booking
        if (assignmentRepository.findByBookingIdAndPhotographerId(booking.getId(), photographer.getId()).isPresent()) {
            throw new ConflictException("Photographer is already assigned to this booking");
        }

        PhotographerAssignment assignment = PhotographerAssignment.builder()
                .booking(booking)
                .photographer(photographer)
                .status(AssignmentStatus.ASSIGNED)
                .attendanceConfirmed(false)
                .notes(request.getNotes())
                .build();

        assignment = assignmentRepository.save(assignment);

        // Update booking status if needed
        if (booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.CONFIRMED) {
            booking.setStatus(BookingStatus.ASSIGNED);
        }

        // Notify photographer
        notificationService.notify(photographer.getId(), "New Assignment",
                "You have been assigned to booking " + booking.getBookingRef() +
                        " on " + booking.getEventDate() + " at " + booking.getVenue(),
                "ASSIGNMENT", "ASSIGNMENT", assignment.getId());

        activityLogService.log(securityUtils.getCurrentUserId(), "ASSIGN_PHOTOGRAPHER",
                "ASSIGNMENT", assignment.getId(),
                "Assigned " + photographer.getFullName() + " to " + booking.getBookingRef());

        return toResponse(assignment);
    }

    @Transactional
    public AssignmentResponse reassign(Long assignmentId, Long newPhotographerId) {
        PhotographerAssignment old = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        User newPhotographer = userRepository.findById(newPhotographerId)
                .orElseThrow(() -> new ResourceNotFoundException("Photographer not found"));

        if (newPhotographer.getRole() != Role.PHOTOGRAPHER) {
            throw new BadRequestException("Selected user is not a photographer");
        }

        if (assignmentRepository.existsConflict(newPhotographer.getId(), old.getBooking().getEventDate())) {
            throw new ConflictException("New photographer is already booked on that date");
        }

        // Cancel old assignment
        old.setStatus(AssignmentStatus.CANCELLED);
        assignmentRepository.save(old);

        // Create new
        PhotographerAssignment newAssignment = PhotographerAssignment.builder()
                .booking(old.getBooking())
                .photographer(newPhotographer)
                .status(AssignmentStatus.ASSIGNED)
                .notes("Reassigned from " + old.getPhotographer().getFullName())
                .build();
        newAssignment = assignmentRepository.save(newAssignment);

        notificationService.notify(newPhotographer.getId(), "New Assignment (Reassigned)",
                "You have been reassigned to booking " + old.getBooking().getBookingRef(),
                "ASSIGNMENT", "ASSIGNMENT", newAssignment.getId());

        notificationService.notify(old.getPhotographer().getId(), "Assignment Cancelled",
                "Your assignment for " + old.getBooking().getBookingRef() + " has been reassigned.",
                "ASSIGNMENT", "ASSIGNMENT", old.getId());

        activityLogService.log(securityUtils.getCurrentUserId(), "REASSIGN_PHOTOGRAPHER",
                "ASSIGNMENT", newAssignment.getId(), "Reassigned photographer");

        return toResponse(newAssignment);
    }

    @Transactional
    public AssignmentResponse updateProgress(Long assignmentId, ProgressUpdateRequest request) {
        PhotographerAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        // Only the assigned photographer or Ops/Director can update
        User current = securityUtils.getCurrentUser();
        if (current.getRole() == Role.PHOTOGRAPHER
                && !assignment.getPhotographer().getId().equals(current.getId())) {
            throw new BadRequestException("You can only update your own assignments");
        }

        assignment.setStatus(request.getStatus());
        if (request.getAttendanceConfirmed() != null) {
            assignment.setAttendanceConfirmed(request.getAttendanceConfirmed());
        }
        if (request.getNotes() != null) {
            assignment.setNotes(request.getNotes());
        }

        assignment = assignmentRepository.save(assignment);

        // Sync booking status
        if (request.getStatus() == AssignmentStatus.IN_PROGRESS) {
            assignment.getBooking().setStatus(BookingStatus.IN_PROGRESS);
        } else if (request.getStatus() == AssignmentStatus.COMPLETED) {
            assignment.getBooking().setStatus(BookingStatus.COMPLETED);
        }

        activityLogService.log(current.getId(), "UPDATE_PROGRESS", "ASSIGNMENT", assignmentId,
                "Status → " + request.getStatus());

        return toResponse(assignment);
    }

    public List<AssignmentResponse> getMyAssignments() {
        User current = securityUtils.getCurrentUser();
        return assignmentRepository.findByPhotographerIdWithBooking(current.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AssignmentResponse> getByBooking(Long bookingId) {
        return assignmentRepository.findByBookingId(bookingId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<User> getAvailablePhotographers() {
        return userRepository.findByRoleAndIsActiveTrue(Role.PHOTOGRAPHER);
    }

    private AssignmentResponse toResponse(PhotographerAssignment a) {
        Booking b = a.getBooking();
        return AssignmentResponse.builder()
                .id(a.getId())
                .bookingId(b.getId())
                .bookingRef(b.getBookingRef())
                .photographerId(a.getPhotographer().getId())
                .photographerName(a.getPhotographer().getFullName())
                .eventDate(b.getEventDate())
                .eventTime(b.getEventTime())
                .venue(b.getVenue())
                .eventType(b.getEventType())
                .packageName(b.getPhotographyPackage().getName())
                .customerName(b.getCustomer().getFullName())
                .status(a.getStatus())
                .attendanceConfirmed(a.getAttendanceConfirmed())
                .notes(a.getNotes())
                .assignedAt(a.getAssignedAt())
                .build();
    }
}

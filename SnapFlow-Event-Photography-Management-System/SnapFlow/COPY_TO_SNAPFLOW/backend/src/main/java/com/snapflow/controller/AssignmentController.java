package com.snapflow.controller;

import com.snapflow.dto.request.AssignmentRequest;
import com.snapflow.dto.request.ProgressUpdateRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.AssignmentResponse;
import com.snapflow.dto.response.UserResponse;
import com.snapflow.entity.User;
import com.snapflow.service.AssignmentService;
import com.snapflow.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> assign(
            @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Photographer assigned", assignmentService.assignPhotographer(request)));
    }

    @PutMapping("/{id}/reassign")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> reassign(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        Long newPhotographerId = body.get("photographerId");
        return ResponseEntity.ok(ApiResponse.ok("Photographer reassigned",
                assignmentService.reassign(id, newPhotographerId)));
    }

    @PatchMapping("/{id}/progress")
    @PreAuthorize("hasAnyRole('PHOTOGRAPHER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateProgress(
            @PathVariable Long id,
            @Valid @RequestBody ProgressUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Progress updated",
                assignmentService.updateProgress(id, request)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PHOTOGRAPHER')")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> myAssignments() {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.getMyAssignments()));
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR', 'CUSTOMER_RELATIONS_OFFICER')")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> byBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.getByBooking(bookingId)));
    }

    @GetMapping("/photographers")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR', 'CUSTOMER_RELATIONS_OFFICER')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> availablePhotographers() {
        List<UserResponse> list = assignmentService.getAvailablePhotographers().stream()
                .map(u -> UserResponse.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .phone(u.getPhone())
                        .role(u.getRole())
                        .isActive(u.getIsActive())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}

package com.snapflow.controller;

import com.snapflow.dto.request.FeedbackCreateRequest;
import com.snapflow.dto.request.FeedbackResponseRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.FeedbackResponse;
import com.snapflow.enums.FeedbackStatus;
import com.snapflow.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
@Tag(name = "Feedback", description = "Inquiries, suggestions, and complaints")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    @Operation(summary = "Submit inquiry, suggestion, or complaint")
    public ResponseEntity<ApiResponse<FeedbackResponse>> submitFeedback(@Valid @RequestBody FeedbackCreateRequest request) {
        FeedbackResponse response = feedbackService.submitFeedback(request);
        return new ResponseEntity<>(ApiResponse.success("Feedback submitted", response), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @Operation(summary = "Get customer's own feedback submissions")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getMyFeedback() {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.getMyFeedback()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "List all feedback for staff management")
    public ResponseEntity<ApiResponse<Page<FeedbackResponse>>> getAllFeedback(
            @RequestParam(required = false) FeedbackStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.getAllFeedback(status, PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @PatchMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Respond to feedback")
    public ResponseEntity<ApiResponse<FeedbackResponse>> respondToFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackResponseRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Response recorded", feedbackService.respondToFeedback(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Delete spam or duplicate feedback")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok(ApiResponse.success("Feedback deleted", null));
    }
}

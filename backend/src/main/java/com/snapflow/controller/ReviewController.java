package com.snapflow.controller;

import com.snapflow.dto.request.ReviewCreateRequest;
import com.snapflow.dto.request.ReviewUpdateRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.ReviewResponse;
import com.snapflow.service.ReviewService;
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
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Customer reviews and ratings for completed events")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Submit a review for a completed event")
    public ResponseEntity<ApiResponse<ReviewResponse>> submitReview(@Valid @RequestBody ReviewCreateRequest request) {
        ReviewResponse response = reviewService.submitReview(request);
        return new ResponseEntity<>(ApiResponse.success("Review submitted", response), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all customer reviews")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getAllReviews(PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/my")
    @Operation(summary = "Get logged-in customer's reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getMyReviews() {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getMyReviews()));
    }

    @GetMapping("/photographer/{photographerId}")
    @Operation(summary = "Get reviews for a specific photographer")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getPhotographerReviews(@PathVariable Long photographerId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getPhotographerReviews(photographerId)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edit your own review")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Review updated", reviewService.updateReview(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete your own review, or moderate as director")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}

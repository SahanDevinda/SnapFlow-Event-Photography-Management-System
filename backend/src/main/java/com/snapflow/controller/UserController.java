package com.snapflow.controller;

import com.snapflow.dto.request.ProfileUpdateRequest;
import com.snapflow.dto.request.UserCreateRequest;
import com.snapflow.dto.request.UserUpdateRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.PublicPhotographerResponse;
import com.snapflow.dto.response.UserResponse;
import com.snapflow.enums.Role;
import com.snapflow.service.UserService;
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
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User directory, profiles, and administration")
public class UserController {

    private final UserService userService;
    private final com.snapflow.service.AuthService authService;

    @GetMapping("/me")
    @Operation(summary = "Verify stored session on frontend startup")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        return ResponseEntity.ok(ApiResponse.success(authService.getCurrentUserResponse()));
    }

    @PutMapping("/me")
    @Operation(summary = "Update the authenticated user's own profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateMyProfile(
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userService.updateOwnProfile(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPANY_DIRECTOR', 'CUSTOMER_RELATIONS_OFFICER')")
    @Operation(summary = "Search and filter users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> searchUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UserResponse> users = userService.searchUsers(role, active, search, PageRequest.of(page, size, Sort.by("fullName").ascending()));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY_DIRECTOR', 'CUSTOMER_RELATIONS_OFFICER', 'OPERATIONS_MANAGER')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPANY_DIRECTOR', 'CUSTOMER_RELATIONS_OFFICER')")
    @Operation(summary = "Create a new user (Staff or Walk-in Customer)")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse response = userService.createUser(request);
        return new ResponseEntity<>(ApiResponse.success("User created successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Update user details")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User updated", userService.updateUser(id, request)));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Deactivate user")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated", null));
    }

    @PatchMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Reactivate user")
    public ResponseEntity<ApiResponse<Void>> reactivateUser(@PathVariable Long id) {
        userService.reactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User reactivated", null));
    }

    @GetMapping("/public/photographers")
    @Operation(summary = "Public photographer directory (names only, no contact details)")
    public ResponseEntity<ApiResponse<List<PublicPhotographerResponse>>> getPublicPhotographers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getPublicPhotographers()));
    }

    @GetMapping("/photographers")
    @Operation(summary = "List all active photographers")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getPhotographers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getActivePhotographers()));
    }

    @GetMapping("/customers")
    @PreAuthorize("hasAnyRole('COMPANY_DIRECTOR', 'CUSTOMER_RELATIONS_OFFICER')")
    @Operation(summary = "List all active customers")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getCustomers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getActiveCustomers()));
    }
}

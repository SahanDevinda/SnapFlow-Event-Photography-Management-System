package com.snapflow.controller;

import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.UserResponse;
import com.snapflow.enums.Role;
import com.snapflow.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getCurrentUserProfile()));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated",
                userService.updateProfile(body.get("firstName"), body.get("lastName"), body.get("phone"))));
    }

    @GetMapping
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @GetMapping("/customers")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getCustomers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getCustomers()));
    }

    @GetMapping("/photographers")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR', 'CUSTOMER_RELATIONS_OFFICER')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getPhotographers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getPhotographers()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY_DIRECTOR', 'CUSTOMER_RELATIONS_OFFICER', 'OPERATIONS_MANAGER')")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getById(id)));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<Void>> toggleActive(@PathVariable Long id) {
        userService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.message("User status updated"));
    }
}

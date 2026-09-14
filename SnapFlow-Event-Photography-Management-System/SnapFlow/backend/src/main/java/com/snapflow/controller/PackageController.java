package com.snapflow.controller;

import com.snapflow.dto.request.PackageRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.PackageResponse;
import com.snapflow.service.PackageService;
import com.snapflow.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageService packageService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PackageResponse>>> getActivePackages() {
        return ResponseEntity.ok(ApiResponse.ok(packageService.getAllActive()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('COMPANY_DIRECTOR', 'CUSTOMER_RELATIONS_OFFICER')")
    public ResponseEntity<ApiResponse<List<PackageResponse>>> getAllPackages() {
        return ResponseEntity.ok(ApiResponse.ok(packageService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PackageResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(packageService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<PackageResponse>> create(@Valid @RequestBody PackageRequest request) {
        PackageResponse created = packageService.create(request, securityUtils.getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Package created", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<PackageResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody PackageRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Package updated",
                packageService.update(id, request, securityUtils.getCurrentUserId())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        packageService.deactivate(id, securityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.message("Package deactivated"));
    }
}

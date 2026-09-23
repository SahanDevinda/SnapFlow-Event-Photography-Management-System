package com.snapflow.controller;

import com.snapflow.dto.request.PackageRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.PackageResponse;
import com.snapflow.service.PackageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/packages")
@RequiredArgsConstructor
@Tag(name = "Photography Packages", description = "Photography package management and public catalogue")
public class PackageController {

    private final PackageService packageService;

    @GetMapping
    @Operation(summary = "Get active packages for public browsing and customer booking")
    public ResponseEntity<ApiResponse<List<PackageResponse>>> getActivePackages() {
        return ResponseEntity.ok(ApiResponse.success(packageService.getActivePackages()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('COMPANY_DIRECTOR', 'CUSTOMER_RELATIONS_OFFICER')")
    @Operation(summary = "Get full package catalogue including inactive items")
    public ResponseEntity<ApiResponse<List<PackageResponse>>> getAllPackages() {
        return ResponseEntity.ok(ApiResponse.success(packageService.getAllPackages()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get package details by ID")
    public ResponseEntity<ApiResponse<PackageResponse>> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(packageService.getPackageById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Create a new photography package")
    public ResponseEntity<ApiResponse<PackageResponse>> createPackage(@Valid @RequestBody PackageRequest request) {
        PackageResponse response = packageService.createPackage(request);
        return new ResponseEntity<>(ApiResponse.success("Package created successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Update photography package")
    public ResponseEntity<ApiResponse<PackageResponse>> updatePackage(@PathVariable Long id, @Valid @RequestBody PackageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Package updated", packageService.updatePackage(id, request)));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Soft-deactivate package")
    public ResponseEntity<ApiResponse<Void>> deactivatePackage(@PathVariable Long id) {
        packageService.deactivatePackage(id);
        return ResponseEntity.ok(ApiResponse.success("Package deactivated", null));
    }

    @PatchMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Reactivate package")
    public ResponseEntity<ApiResponse<Void>> reactivatePackage(@PathVariable Long id) {
        packageService.reactivatePackage(id);
        return ResponseEntity.ok(ApiResponse.success("Package reactivated", null));
    }
}

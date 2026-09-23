package com.snapflow.controller;

import com.snapflow.dto.request.AddOnRequest;
import com.snapflow.dto.response.AddOnResponse;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.service.AddOnService;
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
@RequestMapping("/add-ons")
@RequiredArgsConstructor
@Tag(name = "Add-Ons", description = "Service add-ons management and catalogue")
public class AddOnController {

    private final AddOnService addOnService;

    @GetMapping
    @Operation(summary = "Get active add-ons")
    public ResponseEntity<ApiResponse<List<AddOnResponse>>> getActiveAddOns() {
        return ResponseEntity.ok(ApiResponse.success(addOnService.getActiveAddOns()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('COMPANY_DIRECTOR', 'CUSTOMER_RELATIONS_OFFICER')")
    @Operation(summary = "Get all add-ons including inactive")
    public ResponseEntity<ApiResponse<List<AddOnResponse>>> getAllAddOns() {
        return ResponseEntity.ok(ApiResponse.success(addOnService.getAllAddOns()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get add-on by ID")
    public ResponseEntity<ApiResponse<AddOnResponse>> getAddOnById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(addOnService.getAddOnById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Create an add-on")
    public ResponseEntity<ApiResponse<AddOnResponse>> createAddOn(@Valid @RequestBody AddOnRequest request) {
        AddOnResponse response = addOnService.createAddOn(request);
        return new ResponseEntity<>(ApiResponse.success("Add-on created", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Update add-on")
    public ResponseEntity<ApiResponse<AddOnResponse>> updateAddOn(@PathVariable Long id, @Valid @RequestBody AddOnRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Add-on updated", addOnService.updateAddOn(id, request)));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Soft-deactivate add-on")
    public ResponseEntity<ApiResponse<Void>> deactivateAddOn(@PathVariable Long id) {
        addOnService.deactivateAddOn(id);
        return ResponseEntity.ok(ApiResponse.success("Add-on deactivated", null));
    }

    @PatchMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Reactivate add-on")
    public ResponseEntity<ApiResponse<Void>> reactivateAddOn(@PathVariable Long id) {
        addOnService.reactivateAddOn(id);
        return ResponseEntity.ok(ApiResponse.success("Add-on reactivated", null));
    }
}

package com.snapflow.controller;

import com.snapflow.dto.request.EquipmentAllocationRequest;
import com.snapflow.dto.request.EquipmentRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.EquipmentAllocationResponse;
import com.snapflow.dto.response.EquipmentResponse;
import com.snapflow.service.EquipmentService;
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
@RequestMapping("/equipment")
@RequiredArgsConstructor
@Tag(name = "Equipment", description = "Equipment inventory and allocation")
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping("/available")
    @Operation(summary = "List currently available equipment items")
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> getAvailableEquipment() {
        return ResponseEntity.ok(ApiResponse.success(equipmentService.getAllAvailable()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "List all equipment")
    public ResponseEntity<ApiResponse<Page<EquipmentResponse>>> getAllEquipment(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(equipmentService.getAllEquipment(PageRequest.of(page, size, Sort.by("name").ascending()))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get equipment by ID")
    public ResponseEntity<ApiResponse<EquipmentResponse>> getEquipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(equipmentService.getEquipmentById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Create an equipment item")
    public ResponseEntity<ApiResponse<EquipmentResponse>> createEquipment(@Valid @RequestBody EquipmentRequest request) {
        EquipmentResponse response = equipmentService.createEquipment(request);
        return new ResponseEntity<>(ApiResponse.success("Equipment created", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Update equipment item")
    public ResponseEntity<ApiResponse<EquipmentResponse>> updateEquipment(@PathVariable Long id, @Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Equipment updated", equipmentService.updateEquipment(id, request)));
    }

    @PatchMapping("/{id}/retire")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Retire equipment")
    public ResponseEntity<ApiResponse<Void>> retireEquipment(@PathVariable Long id) {
        equipmentService.retireEquipment(id);
        return ResponseEntity.ok(ApiResponse.success("Equipment retired", null));
    }

    @PatchMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Reactivate a retired equipment item")
    public ResponseEntity<ApiResponse<Void>> reactivateEquipment(@PathVariable Long id) {
        equipmentService.reactivateEquipment(id);
        return ResponseEntity.ok(ApiResponse.success("Equipment reactivated", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Delete equipment (blocked if currently allocated to an active event)")
    public ResponseEntity<ApiResponse<Void>> deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.ok(ApiResponse.success("Equipment deleted successfully", null));
    }

    @PostMapping("/allocate")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Allocate equipment to booking/photographer with conflict detection")
    public ResponseEntity<ApiResponse<EquipmentAllocationResponse>> allocateEquipment(@Valid @RequestBody EquipmentAllocationRequest request) {
        EquipmentAllocationResponse response = equipmentService.allocateEquipment(request);
        return new ResponseEntity<>(ApiResponse.success("Equipment allocated", response), HttpStatus.CREATED);
    }

    @PostMapping("/return/{allocationId}")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Mark allocated equipment as returned")
    public ResponseEntity<ApiResponse<Void>> returnEquipment(@PathVariable Long allocationId) {
        equipmentService.returnEquipment(allocationId);
        return ResponseEntity.ok(ApiResponse.success("Equipment returned successfully", null));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get equipment allocations for a booking")
    public ResponseEntity<ApiResponse<List<EquipmentAllocationResponse>>> getBookingAllocations(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success(equipmentService.getBookingAllocations(bookingId)));
    }
}

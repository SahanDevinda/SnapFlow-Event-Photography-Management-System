package com.snapflow.controller;

import com.snapflow.dto.response.ApiResponse;
import com.snapflow.entity.Equipment;
import com.snapflow.entity.EquipmentAllocation;
import com.snapflow.enums.EquipmentStatus;
import com.snapflow.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<List<Equipment>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.getAll()));
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<List<Equipment>>> getAvailable() {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.getAvailable()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<Equipment>> create(@RequestBody Map<String, String> body) {
        Equipment eq = equipmentService.create(
                body.get("name"), body.get("type"), body.get("serialNumber"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Equipment added", eq));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<Equipment>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        EquipmentStatus status = EquipmentStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.updateStatus(id, status)));
    }

    @PostMapping("/allocate")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<EquipmentAllocation>> allocate(@RequestBody Map<String, Long> body) {
        EquipmentAllocation allocation = equipmentService.allocate(
                body.get("bookingId"),
                body.get("equipmentId"),
                body.get("photographerId"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Equipment allocated", allocation));
    }

    @PutMapping("/allocations/{id}/return")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<Void>> returnEquipment(@PathVariable Long id) {
        equipmentService.returnEquipment(id);
        return ResponseEntity.ok(ApiResponse.message("Equipment returned"));
    }

    @GetMapping("/allocations/booking/{bookingId}")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<List<EquipmentAllocation>>> byBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.getAllocationsByBooking(bookingId)));
    }
}

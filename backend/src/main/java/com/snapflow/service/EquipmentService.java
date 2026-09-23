package com.snapflow.service;

import com.snapflow.dto.request.EquipmentAllocationRequest;
import com.snapflow.dto.request.EquipmentRequest;
import com.snapflow.dto.response.EquipmentAllocationResponse;
import com.snapflow.dto.response.EquipmentResponse;
import com.snapflow.entity.*;
import com.snapflow.enums.EquipmentStatus;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ConflictException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.*;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentAllocationRepository allocationRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<EquipmentResponse> getAllAvailable() {
        return equipmentRepository.findByStatus(EquipmentStatus.AVAILABLE).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<EquipmentResponse> getAllEquipment(Pageable pageable) {
        return equipmentRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public EquipmentResponse getEquipmentById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));
        return mapToResponse(equipment);
    }

    @Transactional
    public EquipmentResponse createEquipment(EquipmentRequest request) {
        String serial = request.getSerialNumber().trim().toUpperCase();
        if (equipmentRepository.existsBySerialNumberIgnoreCase(serial)) {
            throw new ConflictException("Serial number already registered: " + serial);
        }

        Equipment equipment = Equipment.builder()
                .name(request.getName().trim())
                .category(request.getCategory().trim())
                .serialNumber(serial)
                .status(request.getStatus() != null ? request.getStatus() : EquipmentStatus.AVAILABLE)
                .notes(request.getNotes())
                .build();

        Equipment saved = equipmentRepository.save(equipment);
        auditService.log("EQUIPMENT_CREATE", "Registered equipment: " + saved.getName() + " (" + saved.getSerialNumber() + ")");
        return mapToResponse(saved);
    }

    @Transactional
    public EquipmentResponse updateEquipment(Long id, EquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));

        String serial = request.getSerialNumber().trim().toUpperCase();
        if (equipmentRepository.existsBySerialNumberIgnoreCaseAndIdNot(serial, id)) {
            throw new ConflictException("Serial number already in use: " + serial);
        }

        equipment.setName(request.getName().trim());
        equipment.setCategory(request.getCategory().trim());
        equipment.setSerialNumber(serial);
        if (request.getStatus() != null) {
            equipment.setStatus(request.getStatus());
        }
        equipment.setNotes(request.getNotes());

        Equipment updated = equipmentRepository.save(equipment);
        auditService.log("EQUIPMENT_UPDATE", "Updated equipment: " + updated.getSerialNumber());
        return mapToResponse(updated);
    }

    @Transactional
    public void retireEquipment(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));
        equipment.setStatus(EquipmentStatus.RETIRED);
        equipmentRepository.save(equipment);
        auditService.log("EQUIPMENT_RETIRE", "Retired equipment: " + equipment.getSerialNumber());
    }

    /** Brings a retired or under-maintenance item back into the available pool. */
    @Transactional
    public void reactivateEquipment(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));
        equipment.setStatus(EquipmentStatus.AVAILABLE);
        equipmentRepository.save(equipment);
        auditService.log("EQUIPMENT_REACTIVATE", "Reactivated equipment: " + equipment.getSerialNumber());
    }

    @Transactional
    public void deleteEquipment(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));

        // Block deletion if there are any active (not returned) allocations
        List<EquipmentAllocation> activeAllocations = allocationRepository.findByEquipmentIdAndReturnedAtIsNull(id);
        if (!activeAllocations.isEmpty()) {
            throw new BadRequestException(
                    "This equipment cannot be deleted because it is currently allocated to an active event.");
        }

        if (equipment.getStatus() == EquipmentStatus.ALLOCATED) {
            throw new BadRequestException(
                    "This equipment cannot be deleted because it is currently allocated.");
        }

        auditService.log("EQUIPMENT_DELETE", "Deleted equipment: " + equipment.getName() + " (" + equipment.getSerialNumber() + ")");
        equipmentRepository.delete(equipment);
    }

    @Transactional
    public EquipmentAllocationResponse allocateEquipment(EquipmentAllocationRequest request) {
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", request.getEquipmentId()));

        if (equipment.getStatus() == EquipmentStatus.RETIRED || equipment.getStatus() == EquipmentStatus.MAINTENANCE) {
            throw new BadRequestException("Equipment is not available for allocation (Status: " + equipment.getStatus() + ")");
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));

        User photographer = userRepository.findById(request.getPhotographerId())
                .orElseThrow(() -> new ResourceNotFoundException("Photographer", "id", request.getPhotographerId()));

        if (photographer.getRole() != Role.PHOTOGRAPHER) {
            throw new BadRequestException("Selected assignee is not a photographer");
        }

        // Conflict check: prevent overlapping active allocations on the same date/time
        List<EquipmentAllocation> conflicts = allocationRepository.findConflictingAllocations(
                equipment.getId(), booking.getEventDate(), booking.getStartTime(), booking.getEndTime(), booking.getId()
        );

        if (!conflicts.isEmpty()) {
            EquipmentAllocation conflict = conflicts.get(0);
            throw new ConflictException(String.format(
                    "Equipment %s (%s) is already allocated to booking %s on %s from %s to %s",
                    equipment.getName(),
                    equipment.getSerialNumber(),
                    conflict.getBooking().getBookingRef(),
                    conflict.getBooking().getEventDate(),
                    conflict.getBooking().getStartTime(),
                    conflict.getBooking().getEndTime()
            ));
        }

        User allocatedBy = securityUtils.getCurrentUser();

        EquipmentAllocation allocation = EquipmentAllocation.builder()
                .equipment(equipment)
                .booking(booking)
                .photographer(photographer)
                .allocatedBy(allocatedBy)
                .notes(request.getNotes())
                .build();

        equipment.setStatus(EquipmentStatus.ALLOCATED);
        equipmentRepository.save(equipment);

        EquipmentAllocation saved = allocationRepository.save(allocation);
        auditService.log("EQUIPMENT_ALLOCATED",
                "Allocated " + equipment.getName() + " to " + photographer.getFullName() + " for booking " + booking.getBookingRef());

        return mapToAllocationResponse(saved);
    }

    @Transactional
    public void returnEquipment(Long allocationId) {
        EquipmentAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation", "id", allocationId));

        if (allocation.getReturnedAt() != null) {
            throw new BadRequestException("Equipment was already returned on " + allocation.getReturnedAt());
        }

        allocation.setReturnedAt(LocalDateTime.now());
        allocationRepository.save(allocation);

        Equipment equipment = allocation.getEquipment();
        // Check if there are other active allocations
        List<EquipmentAllocation> activeAllocations = allocationRepository.findByEquipmentIdAndReturnedAtIsNull(equipment.getId());
        if (activeAllocations.isEmpty()) {
            equipment.setStatus(EquipmentStatus.AVAILABLE);
            equipmentRepository.save(equipment);
        }

        auditService.log("EQUIPMENT_RETURNED", "Equipment returned: " + equipment.getSerialNumber());
    }

    @Transactional(readOnly = true)
    public List<EquipmentAllocationResponse> getBookingAllocations(Long bookingId) {
        return allocationRepository.findByBookingId(bookingId).stream()
                .map(this::mapToAllocationResponse)
                .toList();
    }

    public EquipmentResponse mapToResponse(Equipment eq) {
        return EquipmentResponse.builder()
                .id(eq.getId())
                .name(eq.getName())
                .category(eq.getCategory())
                .serialNumber(eq.getSerialNumber())
                .status(eq.getStatus())
                .notes(eq.getNotes())
                .createdAt(eq.getCreatedAt())
                .build();
    }

    public EquipmentAllocationResponse mapToAllocationResponse(EquipmentAllocation ea) {
        return EquipmentAllocationResponse.builder()
                .id(ea.getId())
                .equipmentId(ea.getEquipment().getId())
                .equipmentName(ea.getEquipment().getName())
                .equipmentSerialNumber(ea.getEquipment().getSerialNumber())
                .bookingId(ea.getBooking().getId())
                .bookingRef(ea.getBooking().getBookingRef())
                .photographerId(ea.getPhotographer().getId())
                .photographerName(ea.getPhotographer().getFullName())
                .allocatedById(ea.getAllocatedBy().getId())
                .allocatedByName(ea.getAllocatedBy().getFullName())
                .allocatedAt(ea.getAllocatedAt())
                .returnedAt(ea.getReturnedAt())
                .notes(ea.getNotes())
                .build();
    }
}

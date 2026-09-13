package com.snapflow.service;

import com.snapflow.enums.EquipmentStatus;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.EquipmentAllocationRepository;
import com.snapflow.repository.EquipmentRepository;
import com.snapflow.repository.UserRepository;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentAllocationRepository allocationRepository;
    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final ActivityLogService activityLogService;

    public List<Equipment> getAll() {
        return equipmentRepository.findAll();
    }

    public List<Equipment> getAvailable() {
        return equipmentRepository.findByStatus(EquipmentStatus.AVAILABLE);
    }

    public Equipment getById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));
    }

    @Transactional
    public Equipment create(String name, String type, String serialNumber) {
        Equipment eq = Equipment.builder()
                .name(name)
                .type(type)
                .serialNumber(serialNumber)
                .status(EquipmentStatus.AVAILABLE)
                .build();
        eq = equipmentRepository.save(eq);
        activityLogService.log(securityUtils.getCurrentUserId(), "CREATE_EQUIPMENT",
                "EQUIPMENT", eq.getId(), "Added: " + name);
        return eq;
    }

    @Transactional
    public Equipment updateStatus(Long id, EquipmentStatus status) {
        Equipment eq = getById(id);
        eq.setStatus(status);
        return equipmentRepository.save(eq);
    }

    @Transactional
    public EquipmentAllocation allocate(Long bookingId, Long equipmentId, Long photographerId) {
        Booking booking = bookingService.getEntityById(bookingId);
        Equipment equipment = getById(equipmentId);

        if (equipment.getStatus() != EquipmentStatus.AVAILABLE) {
            throw new BadRequestException("Equipment is not available");
        }

        User photographer = null;
        if (photographerId != null) {
            photographer = userRepository.findById(photographerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Photographer not found"));
        }

        EquipmentAllocation allocation = EquipmentAllocation.builder()
                .booking(booking)
                .equipment(equipment)
                .photographer(photographer)
                .build();

        equipment.setStatus(EquipmentStatus.IN_USE);
        equipmentRepository.save(equipment);

        allocation = allocationRepository.save(allocation);
        activityLogService.log(securityUtils.getCurrentUserId(), "ALLOCATE_EQUIPMENT",
                "EQUIPMENT", equipmentId, "Allocated to booking " + booking.getBookingRef());

        return allocation;
    }

    @Transactional
    public void returnEquipment(Long allocationId) {
        EquipmentAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation not found"));

        allocation.setReturnedAt(LocalDateTime.now());
        allocation.getEquipment().setStatus(EquipmentStatus.AVAILABLE);
        equipmentRepository.save(allocation.getEquipment());
        allocationRepository.save(allocation);

        activityLogService.log(securityUtils.getCurrentUserId(), "RETURN_EQUIPMENT",
                "EQUIPMENT", allocation.getEquipment().getId(), "Returned");
    }

    public List<EquipmentAllocation> getAllocationsByBooking(Long bookingId) {
        return allocationRepository.findByBookingId(bookingId);
    }
}

package com.snapflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentAllocationRepository extends JpaRepository<EquipmentAllocation, Long> {

    List<EquipmentAllocation> findByBookingId(Long bookingId);

    List<EquipmentAllocation> findByPhotographerId(Long photographerId);

    List<EquipmentAllocation> findByEquipmentId(Long equipmentId);
}

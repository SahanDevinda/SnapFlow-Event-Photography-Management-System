package com.snapflow.repository;

import com.snapflow.entity.EquipmentAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface EquipmentAllocationRepository extends JpaRepository<EquipmentAllocation, Long> {
    List<EquipmentAllocation> findByBookingId(Long bookingId);
    List<EquipmentAllocation> findByEquipmentIdAndReturnedAtIsNull(Long equipmentId);

    @Query("SELECT ea FROM EquipmentAllocation ea " +
           "JOIN ea.booking b " +
           "WHERE ea.equipment.id = :equipmentId " +
           "AND ea.returnedAt IS NULL " +
           "AND b.status NOT IN ('CANCELLED') " +
           "AND b.eventDate = :eventDate " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime)) " +
           "AND (:excludeBookingId IS NULL OR b.id <> :excludeBookingId)")
    List<EquipmentAllocation> findConflictingAllocations(
            @Param("equipmentId") Long equipmentId,
            @Param("eventDate") LocalDate eventDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeBookingId") Long excludeBookingId
    );
}

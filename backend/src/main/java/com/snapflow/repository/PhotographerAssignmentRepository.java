package com.snapflow.repository;

import com.snapflow.entity.PhotographerAssignment;
import com.snapflow.enums.AssignmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhotographerAssignmentRepository extends JpaRepository<PhotographerAssignment, Long> {
    List<PhotographerAssignment> findByBookingId(Long bookingId);
    Page<PhotographerAssignment> findByPhotographerId(Long photographerId, Pageable pageable);
    List<PhotographerAssignment> findByPhotographerId(Long photographerId);
    Optional<PhotographerAssignment> findByBookingIdAndPhotographerId(Long bookingId, Long photographerId);

    @Query("SELECT pa FROM PhotographerAssignment pa " +
           "JOIN pa.booking b " +
           "WHERE pa.photographer.id = :photographerId " +
           "AND pa.status NOT IN ('CANCELLED') " +
           "AND b.eventDate = :eventDate " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime)) " +
           "AND (:excludeBookingId IS NULL OR b.id <> :excludeBookingId)")
    List<PhotographerAssignment> findConflictingAssignments(
            @Param("photographerId") Long photographerId,
            @Param("eventDate") LocalDate eventDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeBookingId") Long excludeBookingId
    );

    @Query("SELECT pa FROM PhotographerAssignment pa " +
           "JOIN pa.booking b " +
           "WHERE pa.photographer.id = :photographerId " +
           "AND pa.status = 'COMPLETED' " +
           "AND b.eventDate BETWEEN :startDate AND :endDate")
    List<PhotographerAssignment> findCompletedCoverage(
            @Param("photographerId") Long photographerId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    long countByPhotographerIdAndStatus(Long photographerId, AssignmentStatus status);
}

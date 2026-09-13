package com.snapflow.repository;

import com.snapflow.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhotographerAssignmentRepository extends JpaRepository<PhotographerAssignment, Long> {

    List<PhotographerAssignment> findByPhotographerId(Long photographerId);

    List<PhotographerAssignment> findByBookingId(Long bookingId);

    Optional<PhotographerAssignment> findByBookingIdAndPhotographerId(Long bookingId, Long photographerId);

    List<PhotographerAssignment> findByPhotographerIdAndStatus(Long photographerId, AssignmentStatus status);

    /**
     * Conflict detection: Check if a photographer is already assigned on a given date
     * (excluding cancelled assignments).
     */
    @Query("""
        SELECT COUNT(pa) > 0 FROM PhotographerAssignment pa
        JOIN pa.booking b
        WHERE pa.photographer.id = :photographerId
          AND b.eventDate = :eventDate
          AND pa.status <> 'CANCELLED'
          AND b.status <> 'CANCELLED'
        """)
    boolean existsConflict(@Param("photographerId") Long photographerId,
                           @Param("eventDate") LocalDate eventDate);

    @Query("""
        SELECT pa FROM PhotographerAssignment pa
        JOIN FETCH pa.booking b
        WHERE pa.photographer.id = :photographerId
        ORDER BY b.eventDate ASC
        """)
    List<PhotographerAssignment> findByPhotographerIdWithBooking(@Param("photographerId") Long photographerId);
}

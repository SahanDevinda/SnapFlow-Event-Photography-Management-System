package com.snapflow.repository;

import com.snapflow.entity.ChangeRequest;
import com.snapflow.enums.ChangeRequestStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, Long> {
    List<ChangeRequest> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT cr FROM ChangeRequest cr WHERE cr.booking.id = :bookingId ORDER BY cr.id")
    List<ChangeRequest> findByBookingIdForUpdate(@Param("bookingId") Long bookingId);
    Page<ChangeRequest> findByStatus(ChangeRequestStatus status, Pageable pageable);
    List<ChangeRequest> findByBookingCustomerIdOrderByCreatedAtDesc(Long customerId);
    long countByStatus(ChangeRequestStatus status);
}

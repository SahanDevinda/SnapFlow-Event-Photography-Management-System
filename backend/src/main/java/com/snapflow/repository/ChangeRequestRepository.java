package com.snapflow.repository;

import com.snapflow.entity.ChangeRequest;
import com.snapflow.enums.ChangeRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, Long> {
    List<ChangeRequest> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
    Page<ChangeRequest> findByStatus(ChangeRequestStatus status, Pageable pageable);
    List<ChangeRequest> findByBookingCustomerIdOrderByCreatedAtDesc(Long customerId);
    long countByStatus(ChangeRequestStatus status);
}

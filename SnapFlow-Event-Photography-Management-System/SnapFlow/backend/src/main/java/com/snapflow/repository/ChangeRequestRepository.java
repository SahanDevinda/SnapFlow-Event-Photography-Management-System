package com.snapflow.repository;

import com.snapflow.enums.ChangeRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, Long> {

    List<ChangeRequest> findByBookingId(Long bookingId);

    List<ChangeRequest> findByStatus(ChangeRequestStatus status);

    List<ChangeRequest> findByRequestedById(Long userId);

    List<ChangeRequest> findByStatusOrderByCreatedAtDesc(ChangeRequestStatus status);
}

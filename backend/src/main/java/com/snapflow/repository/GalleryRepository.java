package com.snapflow.repository;

import com.snapflow.entity.Gallery;
import com.snapflow.enums.GalleryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GalleryRepository extends JpaRepository<Gallery, Long> {
    Optional<Gallery> findByBookingId(Long bookingId);
    Optional<Gallery> findByAccessCode(String accessCode);
    boolean existsByAccessCode(String accessCode);
    Page<Gallery> findByBookingCustomerId(Long customerId, Pageable pageable);
    Page<Gallery> findByStatus(GalleryStatus status, Pageable pageable);
}

package com.snapflow.repository;

import com.snapflow.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByBookingId(Long bookingId);
    boolean existsByBookingId(Long bookingId);
    List<Review> findByCustomerId(Long customerId);
    Page<Review> findByPhotographerIdOrderByCreatedAtDesc(Long photographerId, Pageable pageable);
    List<Review> findByPhotographerId(Long photographerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.photographer.id = :photographerId")
    Double getAverageRatingForPhotographer(@Param("photographerId") Long photographerId);

    @Query("SELECT AVG(r.rating) FROM Review r")
    Double getOverallAverageRating();
}

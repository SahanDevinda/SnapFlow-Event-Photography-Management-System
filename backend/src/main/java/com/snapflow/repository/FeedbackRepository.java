package com.snapflow.repository;

import com.snapflow.entity.Feedback;
import com.snapflow.enums.FeedbackStatus;
import com.snapflow.enums.FeedbackType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Page<Feedback> findByStatus(FeedbackStatus status, Pageable pageable);
    Page<Feedback> findByType(FeedbackType type, Pageable pageable);
}

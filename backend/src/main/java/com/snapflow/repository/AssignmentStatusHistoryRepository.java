package com.snapflow.repository;

import com.snapflow.entity.AssignmentStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentStatusHistoryRepository extends JpaRepository<AssignmentStatusHistory, Long> {
    List<AssignmentStatusHistory> findByAssignmentIdOrderByCreatedAtDesc(Long assignmentId);
}

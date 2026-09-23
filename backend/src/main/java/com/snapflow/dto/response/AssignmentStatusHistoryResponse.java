package com.snapflow.dto.response;

import com.snapflow.enums.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentStatusHistoryResponse {
    private Long id;
    private Long assignmentId;
    private AssignmentStatus fromStatus;
    private AssignmentStatus toStatus;
    private String remarks;
    private Long changedById;
    private String changedByName;
    private LocalDateTime createdAt;
}

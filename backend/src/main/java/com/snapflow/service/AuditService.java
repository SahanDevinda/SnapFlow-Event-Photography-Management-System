package com.snapflow.service;

import com.snapflow.dto.response.ActivityLogResponse;
import com.snapflow.entity.ActivityLog;
import com.snapflow.entity.User;
import com.snapflow.repository.ActivityLogRepository;
import com.snapflow.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final ActivityLogRepository activityLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String details) {
        Long userId = null;
        String userName = "Anonymous";
        String userEmail = "anonymous@system";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            userId = principal.getId();
            userName = principal.getFullName();
            userEmail = principal.getEmail();
        }

        ActivityLog activityLog = ActivityLog.builder()
                .userId(userId)
                .userName(userName)
                .userEmail(userEmail)
                .action(action)
                .details(details)
                .ipAddress("127.0.0.1")
                .build();

        activityLogRepository.save(activityLog);
        log.info("AUDIT: [{}] by [{}] - {}", action, userEmail, details);
    }

    @Transactional(readOnly = true)
    public Page<ActivityLogResponse> getAllLogs(Pageable pageable) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponse);
    }

    public ActivityLogResponse mapToResponse(ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .userName(log.getUserName())
                .userEmail(log.getUserEmail())
                .action(log.getAction())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }
}

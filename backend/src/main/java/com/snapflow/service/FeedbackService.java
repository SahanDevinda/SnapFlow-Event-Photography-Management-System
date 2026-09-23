package com.snapflow.service;

import com.snapflow.dto.request.FeedbackCreateRequest;
import com.snapflow.dto.request.FeedbackResponseRequest;
import com.snapflow.dto.response.FeedbackResponse;
import com.snapflow.entity.Feedback;
import com.snapflow.entity.User;
import com.snapflow.enums.FeedbackStatus;
import com.snapflow.enums.Role;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.FeedbackRepository;
import com.snapflow.security.UserPrincipal;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final SecurityUtils securityUtils;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    public FeedbackResponse submitFeedback(FeedbackCreateRequest request) {
        User customer = null;
        String name = request.getName();
        String email = request.getEmail();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            customer = securityUtils.getCurrentUser();
            name = customer.getFullName();
            email = customer.getEmail();
        }

        Feedback feedback = Feedback.builder()
                .customer(customer)
                .name(name)
                .email(email)
                .type(request.getType())
                .subject(request.getSubject().trim())
                .message(request.getMessage().trim())
                .status(FeedbackStatus.PENDING)
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        auditService.log("FEEDBACK_SUBMITTED", "Feedback #" + saved.getId() + " type: " + saved.getType());
        return mapToResponse(saved);
    }

    @Transactional
    public FeedbackResponse respondToFeedback(Long feedbackId, FeedbackResponseRequest request) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback", "id", feedbackId));

        User staff = securityUtils.getCurrentUser();
        feedback.setResponse(request.getResponse().trim());
        feedback.setStatus(request.getStatus());
        feedback.setRespondedBy(staff);
        feedback.setRespondedAt(LocalDateTime.now());

        Feedback updated = feedbackRepository.save(feedback);
        auditService.log("FEEDBACK_RESPONDED", "Responded to feedback #" + feedbackId);

        if (feedback.getCustomer() != null) {
            notificationService.createNotification(
                    feedback.getCustomer().getId(),
                    "Response to your " + feedback.getType() + " (" + feedback.getSubject() + ")",
                    request.getResponse(),
                    "FEEDBACK_RESPONSE",
                    "/customer/feedback"
            );
        }

        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public Page<FeedbackResponse> getAllFeedback(FeedbackStatus status, Pageable pageable) {
        if (status != null) {
            return feedbackRepository.findByStatus(status, pageable).map(this::mapToResponse);
        }
        return feedbackRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getMyFeedback() {
        Long customerId = securityUtils.getCurrentUserId();
        return feedbackRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    /** Removes spam / duplicate / abusive submissions from the queue. */
    @Transactional
    public void deleteFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback", "id", id));
        feedbackRepository.delete(feedback);
        auditService.log("FEEDBACK_DELETE", "Deleted feedback #" + id + " (" + feedback.getSubject() + ")");
    }

    public FeedbackResponse mapToResponse(Feedback f) {
        return FeedbackResponse.builder()
                .id(f.getId())
                .customerId(f.getCustomer() != null ? f.getCustomer().getId() : null)
                .name(f.getName())
                .email(f.getEmail())
                .type(f.getType())
                .subject(f.getSubject())
                .message(f.getMessage())
                .status(f.getStatus())
                .response(f.getResponse())
                .respondedById(f.getRespondedBy() != null ? f.getRespondedBy().getId() : null)
                .respondedByName(f.getRespondedBy() != null ? f.getRespondedBy().getFullName() : null)
                .respondedAt(f.getRespondedAt())
                .createdAt(f.getCreatedAt())
                .build();
    }
}

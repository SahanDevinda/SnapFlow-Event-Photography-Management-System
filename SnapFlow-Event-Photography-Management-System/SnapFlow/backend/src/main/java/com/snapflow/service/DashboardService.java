package com.snapflow.service;

import com.snapflow.enums.BookingStatus;
import com.snapflow.enums.Role;
import com.snapflow.repository.BookingRepository;
import com.snapflow.repository.PaymentRepository;
import com.snapflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final BookingService bookingService;

    public DashboardResponse getExecutiveSummary() {
        long totalBookings = bookingRepository.count();
        long pending = bookingRepository.countByStatus(BookingStatus.PENDING);
        long confirmed = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long completed = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        long upcoming = bookingRepository.countUpcomingEvents(LocalDate.now());

        BigDecimal revenue = paymentRepository.getTotalVerifiedRevenue();
        if (revenue == null) revenue = BigDecimal.ZERO;

        BigDecimal outstanding = paymentRepository.getTotalOutstandingBalance();
        if (outstanding == null) outstanding = BigDecimal.ZERO;

        long activePhotographers = userRepository.findByRoleAndIsActiveTrue(Role.PHOTOGRAPHER).size();

        List<BookingResponse> recent = bookingRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(bookingService::toResponse)
                .collect(Collectors.toList());

        Map<String, Long> byStatus = new HashMap<>();
        for (BookingStatus status : BookingStatus.values()) {
            byStatus.put(status.name(), bookingRepository.countByStatus(status));
        }

        return DashboardResponse.builder()
                .totalBookings(totalBookings)
                .pendingBookings(pending)
                .confirmedBookings(confirmed)
                .completedEvents(completed)
                .upcomingEvents(upcoming)
                .totalRevenue(revenue)
                .outstandingPayments(outstanding)
                .activePhotographers(activePhotographers)
                .recentBookings(recent)
                .bookingsByStatus(byStatus)
                .build();
    }
}

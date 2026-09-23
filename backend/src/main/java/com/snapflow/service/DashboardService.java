package com.snapflow.service;

import com.snapflow.dto.response.AssignmentResponse;
import com.snapflow.dto.response.DashboardMetricsResponse;
import com.snapflow.dto.response.PhotographerCoverageResponse;
import com.snapflow.entity.PhotographerAssignment;
import com.snapflow.entity.User;
import com.snapflow.enums.AssignmentStatus;
import com.snapflow.enums.BookingStatus;
import com.snapflow.enums.Role;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final PhotographerAssignmentRepository assignmentRepository;
    private final ReviewRepository reviewRepository;
    private final AssignmentService assignmentService;
    private final ReviewService reviewService;

    @Transactional(readOnly = true)
    public DashboardMetricsResponse getExecutiveMetrics() {
        BigDecimal totalSales = bookingRepository.sumTotalSales();
        BigDecimal verifiedRevenue = bookingRepository.sumTotalPaidRevenue();
        BigDecimal outstandingBalance = bookingRepository.sumTotalOutstandingBalance();

        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalPhotographers = userRepository.countByRole(Role.PHOTOGRAPHER);
        long activePackagesCount = packageRepository.countByActiveTrue();
        long totalBookings = bookingRepository.count();

        Map<String, Long> bookingStatusCounts = new LinkedHashMap<>();
        for (BookingStatus status : BookingStatus.values()) {
            bookingStatusCounts.put(status.name(), bookingRepository.countByStatus(status));
        }

        // Calculate monthly revenue for the past 6 months
        Map<String, BigDecimal> monthlyRevenue = new LinkedHashMap<>();
        YearMonth currentMonth = YearMonth.now();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = currentMonth.minusMonths(i);
            LocalDateTime start = ym.atDay(1).atStartOfDay();
            LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);
            BigDecimal revenue = paymentRepository.sumVerifiedAmountBetween(start, end);
            monthlyRevenue.put(ym.format(monthFormatter), revenue != null ? revenue : BigDecimal.ZERO);
        }

        // Photographer workload (count of non-cancelled assignments)
        Map<String, Long> photographerWorkload = new LinkedHashMap<>();
        List<User> photographers = userRepository.findByRoleAndActiveTrue(Role.PHOTOGRAPHER);
        for (User p : photographers) {
            long count = assignmentRepository.countByPhotographerIdAndStatus(p.getId(), AssignmentStatus.ASSIGNED)
                       + assignmentRepository.countByPhotographerIdAndStatus(p.getId(), AssignmentStatus.CONFIRMED)
                       + assignmentRepository.countByPhotographerIdAndStatus(p.getId(), AssignmentStatus.IN_PROGRESS);
            photographerWorkload.put(p.getFullName(), count);
        }

        return DashboardMetricsResponse.builder()
                .totalSales(totalSales != null ? totalSales : BigDecimal.ZERO)
                .verifiedRevenue(verifiedRevenue != null ? verifiedRevenue : BigDecimal.ZERO)
                .outstandingBalance(outstandingBalance != null ? outstandingBalance : BigDecimal.ZERO)
                .totalCustomers(totalCustomers)
                .totalPhotographers(totalPhotographers)
                .activePackagesCount(activePackagesCount)
                .totalBookings(totalBookings)
                .bookingStatusCounts(bookingStatusCounts)
                .monthlyRevenue(monthlyRevenue)
                .photographerWorkload(photographerWorkload)
                .build();
    }

    @Transactional(readOnly = true)
    public PhotographerCoverageResponse getPhotographerCoverageSummary(Long photographerId) {
        User photographer = userRepository.findById(photographerId)
                .orElseThrow(() -> new ResourceNotFoundException("Photographer", "id", photographerId));

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        List<PhotographerAssignment> completedAssignments = assignmentRepository.findCompletedCoverage(
                photographerId, startOfMonth, endOfMonth
        );

        Double avgRating = reviewRepository.getAverageRatingForPhotographer(photographerId);

        List<AssignmentResponse> recentCompleted = completedAssignments.stream()
                .map(assignmentService::mapToResponse)
                .toList();

        var recentReviews = reviewRepository.findByPhotographerId(photographerId).stream()
                .map(reviewService::mapToResponse)
                .toList();

        return PhotographerCoverageResponse.builder()
                .photographerId(photographer.getId())
                .photographerName(photographer.getFullName())
                .totalCompletedEvents(completedAssignments.size())
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .recentCompletedAssignments(recentCompleted)
                .recentReviews(recentReviews)
                .build();
    }
}

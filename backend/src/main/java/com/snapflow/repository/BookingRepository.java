package com.snapflow.repository;

import com.snapflow.entity.Booking;
import com.snapflow.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingRef(String bookingRef);
    boolean existsByBookingRef(String bookingRef);
    
    Page<Booking> findByCustomerId(Long customerId, Pageable pageable);
    List<Booking> findByCustomerId(Long customerId);

    @Query("SELECT b FROM Booking b WHERE " +
           "(:customerId IS NULL OR b.customer.id = :customerId) AND " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:startDate IS NULL OR b.eventDate >= :startDate) AND " +
           "(:endDate IS NULL OR b.eventDate <= :endDate) AND " +
           "(:search IS NULL OR LOWER(b.bookingRef) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.customer.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.venue) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Booking> filterBookings(@Param("customerId") Long customerId,
                                 @Param("status") BookingStatus status,
                                 @Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("search") String search,
                                 Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.eventDate = :date AND b.status NOT IN ('CANCELLED') AND " +
           "((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findOverlappingBookings(@Param("date") LocalDate date,
                                         @Param("startTime") LocalTime startTime,
                                         @Param("endTime") LocalTime endTime);

    @Query("SELECT b FROM Booking b WHERE b.eventDate BETWEEN :startDate AND :endDate AND b.status NOT IN ('CANCELLED')")
    List<Booking> findActiveEventsBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT b FROM Booking b WHERE b.status IN ('CONFIRMED', 'ASSIGNED') AND b.assignments IS EMPTY")
    List<Booking> findUnassignedActiveBookings();

    long countByStatus(BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status NOT IN ('CANCELLED')")
    BigDecimal sumTotalSales();

    @Query("SELECT COALESCE(SUM(b.paidAmount), 0) FROM Booking b WHERE b.status NOT IN ('CANCELLED')")
    BigDecimal sumTotalPaidRevenue();

    @Query("SELECT COALESCE(SUM(b.balanceAmount), 0) FROM Booking b WHERE b.status NOT IN ('CANCELLED')")
    BigDecimal sumTotalOutstandingBalance();

    @Query("SELECT b FROM Booking b WHERE b.eventDate = :targetDate AND b.balanceAmount > 0 AND b.status NOT IN ('CANCELLED')")
    List<Booking> findBookingsNeedingBalanceReminder(@Param("targetDate") LocalDate targetDate);
}

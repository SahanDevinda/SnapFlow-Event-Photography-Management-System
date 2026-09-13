package com.snapflow.repository;

import com.snapflow.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByBookingId(Long bookingId);

    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByStatusOrderByCreatedAtDesc(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'VERIFIED'")
    BigDecimal getTotalVerifiedRevenue();

    @Query("SELECT COALESCE(SUM(b.balanceAmount), 0) FROM Booking b WHERE b.status NOT IN ('CANCELLED')")
    BigDecimal getTotalOutstandingBalance();
}

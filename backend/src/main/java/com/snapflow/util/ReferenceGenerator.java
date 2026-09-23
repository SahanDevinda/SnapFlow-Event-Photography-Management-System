package com.snapflow.util;

import com.snapflow.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ReferenceGenerator {

    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public synchronized String generateBookingReference() {
        int year = LocalDate.now().getYear();
        long count = bookingRepository.count() + 1;
        String ref = String.format("SF-%d-%04d", year, count);
        
        // Ensure uniqueness in rare case
        while (bookingRepository.existsByBookingRef(ref)) {
            count++;
            ref = String.format("SF-%d-%04d", year, count);
        }
        return ref;
    }

    public static String generateAccessCode() {
        // 8 characters unpredictable uppercase alphanumeric
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }
}

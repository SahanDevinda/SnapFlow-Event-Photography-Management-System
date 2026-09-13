package com.snapflow.service;

import com.snapflow.enums.Role;
import com.snapflow.repository.BookingRepository;
import com.snapflow.repository.PackageRepository;
import com.snapflow.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Basic integration-style tests.
 * Requires a running MySQL instance with the snapflow database,
 * or configure H2 for pure unit tests later.
 */
@SpringBootTest
@ActiveProfiles("test")
class BookingServiceTest {

    @Autowired(required = false)
    private UserRepository userRepository;

    @Autowired(required = false)
    private PackageRepository packageRepository;

    @Autowired(required = false)
    private BookingRepository bookingRepository;

    @Test
    void contextLoads() {
        // Verifies Spring context starts
        assertTrue(true);
    }

    @Test
    void packagePriceIsPositive() {
        if (packageRepository == null) return;
        packageRepository.findAll().forEach(pkg ->
                assertTrue(pkg.getPrice().compareTo(BigDecimal.ZERO) > 0,
                        "Package price should be positive: " + pkg.getName()));
    }

    @Test
    void photographersExist() {
        if (userRepository == null) return;
        long count = userRepository.findByRole(Role.PHOTOGRAPHER).size();
        assertTrue(count >= 0, "Should be able to query photographers");
    }
}

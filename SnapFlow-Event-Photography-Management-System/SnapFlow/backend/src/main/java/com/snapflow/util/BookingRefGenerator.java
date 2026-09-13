package com.snapflow.util;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class BookingRefGenerator {

    private final AtomicInteger counter = new AtomicInteger(100);

    public String generate() {
        int year = LocalDate.now().getYear();
        int seq = counter.incrementAndGet();
        return String.format("SF-%d-%03d", year, seq);
    }
}

package com.snapflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Aggregation: Links Photographer + Equipment + Booking.
 * Equipment can exist independently of any Photographer.
 */
@Entity
@Table(name = "equipment_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    // Aggregation: Photographer may be allocated equipment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photographer_id")
    private User photographer;

    @CreationTimestamp
    @Column(name = "allocated_at", updatable = false)
    private LocalDateTime allocatedAt;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;
}

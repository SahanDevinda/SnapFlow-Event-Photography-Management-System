package com.snapflow.entity;

import com.snapflow.enums.ChangeRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "change_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposed_package_id")
    private Package proposedPackage;

    @Column(name = "proposed_date")
    private LocalDate proposedDate;

    @Column(name = "proposed_start_time")
    private LocalTime proposedStartTime;

    @Column(name = "proposed_end_time")
    private LocalTime proposedEndTime;

    @Column(name = "proposed_venue")
    private String proposedVenue;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_difference", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal priceDifference = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ChangeRequestStatus status = ChangeRequestStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @ManyToMany
    @JoinTable(
        name = "change_request_add_ons",
        joinColumns = @JoinColumn(name = "change_request_id"),
        inverseJoinColumns = @JoinColumn(name = "add_on_id")
    )
    @Builder.Default
    private List<AddOn> requestedAddOns = new ArrayList<>();
}

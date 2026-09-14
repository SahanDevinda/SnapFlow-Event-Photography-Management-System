package com.snapflow.entity;

import com.snapflow.enums.AssignmentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "photographer_assignments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"booking_id", "photographer_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotographerAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // Association: Assignment belongs to one Photographer (User with PHOTOGRAPHER role)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photographer_id", nullable = false)
    private User photographer;

    @CreationTimestamp
    @Column(name = "assigned_at", updatable = false)
    private LocalDateTime assignedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AssignmentStatus status = AssignmentStatus.ASSIGNED;

    @Column(name = "attendance_confirmed")
    @Builder.Default
    private Boolean attendanceConfirmed = false;

    @Column(columnDefinition = "TEXT")
    private String notes;
}

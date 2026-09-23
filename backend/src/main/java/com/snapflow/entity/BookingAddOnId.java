package com.snapflow.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class BookingAddOnId implements Serializable {
    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "add_on_id")
    private Long addOnId;
}

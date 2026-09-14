package com.snapflow.entity;

import com.snapflow.enums.EquipmentStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "equipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String type;

    @Column(name = "serial_number", length = 50)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EquipmentStatus status = EquipmentStatus.AVAILABLE;

    @Column(columnDefinition = "TEXT")
    private String notes;
}

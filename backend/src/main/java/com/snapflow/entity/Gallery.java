package com.snapflow.entity;

import com.snapflow.enums.GalleryStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "galleries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gallery extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "access_code", nullable = false, unique = true, length = 16)
    private String accessCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private GalleryStatus status = GalleryStatus.DRAFT;

    @Column(name = "cover_photo_id")
    private Long coverPhotoId;

    @Column(name = "proof_selection_enabled", nullable = false)
    @Builder.Default
    private boolean proofSelectionEnabled = false;

    @Column(name = "proof_deadline")
    private LocalDate proofDeadline;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @OneToMany(mappedBy = "gallery", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Photo> photos = new ArrayList<>();
}

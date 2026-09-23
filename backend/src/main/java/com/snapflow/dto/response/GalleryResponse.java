package com.snapflow.dto.response;

import com.snapflow.enums.GalleryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GalleryResponse {
    private Long id;
    private Long bookingId;
    private String bookingRef;
    private String customerName;
    private String title;
    private String accessCode;
    private GalleryStatus status;
    private Long coverPhotoId;
    private boolean proofSelectionEnabled;
    private LocalDate proofDeadline;
    private LocalDateTime publishedAt;
    private int photoCount;
    private List<PhotoResponse> photos;
    private LocalDateTime createdAt;
}

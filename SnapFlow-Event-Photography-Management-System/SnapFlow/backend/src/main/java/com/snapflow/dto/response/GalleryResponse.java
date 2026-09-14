package com.snapflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class GalleryResponse {
    private Long id;
    private Long bookingId;
    private String bookingRef;
    private String title;
    private Boolean isPublished;
    private LocalDateTime publishedAt;
    private String accessCode;
    private List<PhotoResponse> photos;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class PhotoResponse {
        private Long id;
        private String fileName;
        private String filePath;
        private String caption;
        private Boolean isCover;
        private LocalDateTime uploadedAt;
    }
}

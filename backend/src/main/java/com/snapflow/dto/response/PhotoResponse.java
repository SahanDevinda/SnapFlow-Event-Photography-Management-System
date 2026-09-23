package com.snapflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoResponse {
    private Long id;
    private Long galleryId;
    private String fileName;
    private String originalFileName;
    private Long fileSize;
    private String contentType;
    private String caption;
    private boolean selectedProof;
    private boolean cover;
    private LocalDateTime uploadedAt;
}

package com.snapflow.dto.request;

import com.snapflow.enums.GalleryStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GalleryUpdateRequest {
    @Size(max = 150, message = "Gallery title cannot exceed 150 characters")
    private String title;
    private GalleryStatus status;
    private Long coverPhotoId;
    private Boolean proofSelectionEnabled;
    private LocalDate proofDeadline;
}

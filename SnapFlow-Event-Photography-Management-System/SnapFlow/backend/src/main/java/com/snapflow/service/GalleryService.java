package com.snapflow.service;

import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.GalleryRepository;
import com.snapflow.repository.PhotoRepository;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GalleryService {

    private final GalleryRepository galleryRepository;
    private final PhotoRepository photoRepository;
    private final BookingService bookingService;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    @Transactional
    public GalleryResponse createGallery(Long bookingId, String title) {
        Booking booking = bookingService.getEntityById(bookingId);

        if (galleryRepository.findByBookingId(bookingId).isPresent()) {
            throw new BadRequestException("Gallery already exists for this booking");
        }

        Gallery gallery = Gallery.builder()
                .booking(booking)
                .title(title != null ? title : booking.getBookingRef() + " Gallery")
                .isPublished(false)
                .accessCode(generateAccessCode())
                .build();

        gallery = galleryRepository.save(gallery);
        activityLogService.log(securityUtils.getCurrentUserId(), "CREATE_GALLERY", "GALLERY",
                gallery.getId(), "Created gallery for " + booking.getBookingRef());

        return toResponse(gallery);
    }

    @Transactional
    public GalleryResponse addPhoto(Long galleryId, String fileName, String filePath, String caption) {
        Gallery gallery = galleryRepository.findById(galleryId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery not found"));

        Photo photo = Photo.builder()
                .gallery(gallery)
                .fileName(fileName)
                .filePath(filePath)
                .caption(caption)
                .isCover(gallery.getPhotos().isEmpty())
                .build();

        photoRepository.save(photo);
        gallery.getPhotos().add(photo);

        return toResponse(gallery);
    }

    @Transactional
    public GalleryResponse publish(Long galleryId) {
        Gallery gallery = galleryRepository.findById(galleryId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery not found"));

        gallery.setIsPublished(true);
        gallery.setPublishedAt(LocalDateTime.now());
        gallery = galleryRepository.save(gallery);

        // Notify customer
        notificationService.notify(gallery.getBooking().getCustomer().getId(),
                "Gallery Available",
                "Your photo gallery for booking " + gallery.getBooking().getBookingRef() +
                        " is now available. Access code: " + gallery.getAccessCode(),
                "GALLERY", "GALLERY", gallery.getId());

        activityLogService.log(securityUtils.getCurrentUserId(), "PUBLISH_GALLERY", "GALLERY",
                galleryId, "Published gallery");

        return toResponse(gallery);
    }

    public GalleryResponse getByBooking(Long bookingId) {
        Gallery gallery = galleryRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery not found for booking"));
        return toResponse(gallery);
    }

    public GalleryResponse getById(Long id) {
        Gallery gallery = galleryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery not found"));
        return toResponse(gallery);
    }

    public GalleryResponse getByAccessCode(String code) {
        Gallery gallery = galleryRepository.findByAccessCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid access code"));
        if (Boolean.FALSE.equals(gallery.getIsPublished())) {
            throw new BadRequestException("Gallery is not yet published");
        }
        return toResponse(gallery);
    }

    private String generateAccessCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private GalleryResponse toResponse(Gallery g) {
        List<GalleryResponse.PhotoResponse> photos = g.getPhotos() != null
                ? g.getPhotos().stream().map(p -> GalleryResponse.PhotoResponse.builder()
                        .id(p.getId())
                        .fileName(p.getFileName())
                        .filePath(p.getFilePath())
                        .caption(p.getCaption())
                        .isCover(p.getIsCover())
                        .uploadedAt(p.getUploadedAt())
                        .build()).collect(Collectors.toList())
                : List.of();

        return GalleryResponse.builder()
                .id(g.getId())
                .bookingId(g.getBooking().getId())
                .bookingRef(g.getBooking().getBookingRef())
                .title(g.getTitle())
                .isPublished(g.getIsPublished())
                .publishedAt(g.getPublishedAt())
                .accessCode(g.getAccessCode())
                .photos(photos)
                .createdAt(g.getCreatedAt())
                .build();
    }
}

package com.snapflow.service;

import com.snapflow.dto.request.GalleryCreateRequest;
import com.snapflow.dto.request.GalleryUpdateRequest;
import com.snapflow.dto.response.GalleryResponse;
import com.snapflow.dto.response.PhotoResponse;
import com.snapflow.entity.Booking;
import com.snapflow.entity.Gallery;
import com.snapflow.entity.Photo;
import com.snapflow.entity.User;
import com.snapflow.enums.BookingStatus;
import com.snapflow.enums.GalleryStatus;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ForbiddenException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.BookingRepository;
import com.snapflow.repository.GalleryRepository;
import com.snapflow.repository.PhotoRepository;
import com.snapflow.util.FileStorageService;
import com.snapflow.util.ReferenceGenerator;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GalleryService {

    private final GalleryRepository galleryRepository;
    private final PhotoRepository photoRepository;
    private final BookingRepository bookingRepository;
    private final FileStorageService fileStorageService;
    private final SecurityUtils securityUtils;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    public GalleryResponse createGallery(GalleryCreateRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));

        if (booking.getStatus() != BookingStatus.IN_PROGRESS && booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("Galleries can only be prepared for IN_PROGRESS or COMPLETED events");
        }

        if (galleryRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new BadRequestException("A gallery already exists for this booking");
        }

        Gallery gallery = Gallery.builder()
                .booking(booking)
                .title(request.getTitle().trim())
                .accessCode(ReferenceGenerator.generateAccessCode())
                .status(GalleryStatus.DRAFT)
                .proofSelectionEnabled(request.isProofSelectionEnabled())
                .proofDeadline(request.getProofDeadline())
                .build();

        Gallery saved = galleryRepository.save(gallery);
        auditService.log("GALLERY_CREATE", "Created gallery for " + booking.getBookingRef());
        return mapToResponse(saved, true);
    }

    @Transactional
    public GalleryResponse updateGallery(Long galleryId, GalleryUpdateRequest request) {
        Gallery gallery = galleryRepository.findById(galleryId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery", "id", galleryId));

        validateGalleryManagementAccess(gallery);

        if (request.getTitle() != null) {
            gallery.setTitle(request.getTitle().trim());
        }
        if (request.getCoverPhotoId() != null) {
            setCoverPhoto(gallery, request.getCoverPhotoId());
        }
        if (request.getProofSelectionEnabled() != null) {
            gallery.setProofSelectionEnabled(request.getProofSelectionEnabled());
        }
        if (request.getProofDeadline() != null) {
            gallery.setProofDeadline(request.getProofDeadline());
        }
        if (request.getStatus() != null && request.getStatus() != gallery.getStatus()) {
            if (request.getStatus() == GalleryStatus.PUBLISHED) {
                publishGallery(gallery);
            } else {
                gallery.setStatus(request.getStatus());
            }
        }

        Gallery updated = galleryRepository.save(gallery);
        auditService.log("GALLERY_UPDATE", "Updated gallery " + gallery.getId());
        return mapToResponse(updated, true);
    }

    @Transactional
    public List<PhotoResponse> uploadPhotos(Long galleryId, List<MultipartFile> files) {
        Gallery gallery = galleryRepository.findById(galleryId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery", "id", galleryId));

        validateGalleryManagementAccess(gallery);

        if (files == null || files.isEmpty()) {
            throw new BadRequestException("No files provided for upload");
        }

        List<Photo> photoList = new ArrayList<>();
        boolean isFirstPhoto = photoRepository.countByGalleryId(galleryId) == 0;

        for (MultipartFile file : files) {
            String storedFileName = fileStorageService.storePhoto(file);
            Photo photo = Photo.builder()
                    .gallery(gallery)
                    .fileName(storedFileName)
                    .originalFileName(file.getOriginalFilename())
                    .filePath("photos/" + storedFileName)
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .isSelectedProof(false)
                    .isCover(isFirstPhoto)
                    .build();
            photoList.add(photo);
            if (isFirstPhoto) {
                isFirstPhoto = false;
            }
        }

        List<Photo> saved = photoRepository.saveAll(photoList);

        if (gallery.getCoverPhotoId() == null && !saved.isEmpty()) {
            gallery.setCoverPhotoId(saved.get(0).getId());
            galleryRepository.save(gallery);
        }

        auditService.log("PHOTOS_UPLOADED", "Uploaded " + saved.size() + " photos to gallery " + gallery.getId());

        return saved.stream().map(this::mapToPhotoResponse).toList();
    }

    @Transactional
    public void deletePhoto(Long galleryId, Long photoId) {
        Gallery gallery = galleryRepository.findById(galleryId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery", "id", galleryId));
        validateGalleryManagementAccess(gallery);

        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", "id", photoId));

        if (!photo.getGallery().getId().equals(galleryId)) {
            throw new BadRequestException("Photo does not belong to this gallery");
        }

        fileStorageService.deletePhotoFile(photo.getFileName());
        photoRepository.delete(photo);

        if (gallery.getCoverPhotoId() != null && gallery.getCoverPhotoId().equals(photoId)) {
            gallery.setCoverPhotoId(null);
            galleryRepository.save(gallery);
        }

        auditService.log("PHOTO_DELETED", "Deleted photo #" + photoId + " from gallery " + galleryId);
    }

    @Transactional
    public void deleteGallery(Long galleryId) {
        Gallery gallery = galleryRepository.findById(galleryId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery", "id", galleryId));

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER) {
            throw new ForbiddenException("Customers cannot delete galleries");
        }

        // Delete all physical photo files first
        List<Photo> photos = photoRepository.findByGalleryIdOrderByUploadedAtAsc(galleryId);
        for (Photo photo : photos) {
            try {
                fileStorageService.deletePhotoFile(photo.getFileName());
            } catch (Exception ignored) {
                // Continue even if a file is missing on disk
            }
        }

        // Delete all photo records, then the gallery
        photoRepository.deleteAll(photos);
        galleryRepository.delete(gallery);
        auditService.log("GALLERY_DELETED", "Deleted gallery #" + galleryId + " by " + currentUser.getEmail());
    }


    @Transactional
    public PhotoResponse updatePhotoCaption(Long galleryId, Long photoId, String caption) {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", "id", photoId));

        if (!photo.getGallery().getId().equals(galleryId)) {
            throw new BadRequestException("Photo does not belong to this gallery");
        }

        validateGalleryManagementAccess(photo.getGallery());

        photo.setCaption(caption);
        Photo updated = photoRepository.save(photo);
        return mapToPhotoResponse(updated);
    }

    @Transactional
    public void setCoverPhoto(Gallery gallery, Long photoId) {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", "id", photoId));

        if (!photo.getGallery().getId().equals(gallery.getId())) {
            throw new BadRequestException("Photo does not belong to this gallery");
        }

        List<Photo> photos = photoRepository.findByGalleryIdOrderByUploadedAtAsc(gallery.getId());
        for (Photo p : photos) {
            p.setCover(p.getId().equals(photoId));
        }
        photoRepository.saveAll(photos);

        gallery.setCoverPhotoId(photoId);
    }

    @Transactional
    public void toggleProofSelection(Long galleryId, Long photoId, boolean selected) {
        Gallery gallery = galleryRepository.findById(galleryId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery", "id", galleryId));

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !gallery.getBooking().getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only select proof photos for your own gallery");
        }

        if (!gallery.isProofSelectionEnabled()) {
            throw new BadRequestException("Proof selection is currently closed for this gallery");
        }

        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", "id", photoId));

        if (!photo.getGallery().getId().equals(galleryId)) {
            throw new BadRequestException("Photo does not belong to this gallery");
        }

        photo.setSelectedProof(selected);
        photoRepository.save(photo);
    }

    @Transactional
    public void publishGallery(Gallery gallery) {
        long photoCount = photoRepository.countByGalleryId(gallery.getId());
        if (photoCount == 0) {
            throw new BadRequestException("Cannot publish an empty gallery. Upload at least one photo first.");
        }

        gallery.setStatus(GalleryStatus.PUBLISHED);
        gallery.setPublishedAt(LocalDateTime.now());
        galleryRepository.save(gallery);

        auditService.log("GALLERY_PUBLISHED", "Published gallery " + gallery.getId());

        notificationService.createNotification(
                gallery.getBooking().getCustomer().getId(),
                "Your Photos Are Ready! (" + gallery.getTitle() + ")",
                "Your gallery has been published. View your photos and download your album online.",
                "GALLERY",
                "/customer/galleries/" + gallery.getId()
        );
    }

    @Transactional(readOnly = true)
    public GalleryResponse getGalleryById(Long id) {
        Gallery gallery = galleryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery", "id", id));
        validateGalleryViewAccess(gallery);
        return mapToResponse(gallery, true);
    }

    @Transactional(readOnly = true)
    public GalleryResponse getGalleryByBookingId(Long bookingId) {
        Gallery gallery = galleryRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery", "bookingId", bookingId));
        validateGalleryViewAccess(gallery);
        return mapToResponse(gallery, true);
    }

    @Transactional(readOnly = true)
    public GalleryResponse getPublicGalleryByAccessCode(String accessCode) {
        Gallery gallery = galleryRepository.findByAccessCode(accessCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Gallery not found or invalid access code"));

        if (gallery.getStatus() != GalleryStatus.PUBLISHED) {
            throw new ForbiddenException("This gallery is not yet published");
        }

        return mapToResponse(gallery, true);
    }

    @Transactional(readOnly = true)
    public Resource streamPhotoSecurely(Long photoId, String accessCode) {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", "id", photoId));

        Gallery gallery = photo.getGallery();

        if (accessCode != null && !accessCode.isBlank()) {
            if (!gallery.getAccessCode().equalsIgnoreCase(accessCode.trim()) || gallery.getStatus() != GalleryStatus.PUBLISHED) {
                throw new ForbiddenException("Invalid access code or unpublished gallery");
            }
        } else {
            validateGalleryViewAccess(gallery);
        }

        return fileStorageService.loadPhotoAsResource(photo.getFileName());
    }

    @Transactional(readOnly = true)
    public byte[] downloadGalleryZip(Long galleryId, String accessCode) {
        Gallery gallery = galleryRepository.findById(galleryId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery", "id", galleryId));

        if (accessCode != null && !accessCode.isBlank()) {
            if (!gallery.getAccessCode().equalsIgnoreCase(accessCode.trim()) || gallery.getStatus() != GalleryStatus.PUBLISHED) {
                throw new ForbiddenException("Invalid access code or unpublished gallery");
            }
        } else {
            validateGalleryViewAccess(gallery);
        }

        List<Photo> photos = photoRepository.findByGalleryIdOrderByUploadedAtAsc(galleryId);
        if (photos.isEmpty()) {
            throw new BadRequestException("No photos in gallery to download");
        }

        Map<String, String> fileMap = new LinkedHashMap<>();
        for (Photo p : photos) {
            fileMap.put(p.getFileName(), p.getOriginalFileName());
        }

        return fileStorageService.createZipArchive(fileMap);
    }

    @Transactional(readOnly = true)
    public Page<GalleryResponse> getMyCustomerGalleries(Pageable pageable) {
        Long customerId = securityUtils.getCurrentUserId();
        return galleryRepository.findByBookingCustomerId(customerId, pageable)
                .map(g -> mapToResponse(g, false));
    }

    @Transactional(readOnly = true)
    public Page<GalleryResponse> getAllGalleries(Pageable pageable) {
        return galleryRepository.findAll(pageable).map(g -> mapToResponse(g, false));
    }

    private void validateGalleryViewAccess(Gallery gallery) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER && !gallery.getBooking().getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You cannot access another customer's gallery");
        }
        if (currentUser.getRole() == Role.PHOTOGRAPHER) {
            boolean isAssigned = gallery.getBooking().getAssignments().stream()
                    .anyMatch(a -> a.getPhotographer().getId().equals(currentUser.getId()));
            if (!isAssigned) {
                throw new ForbiddenException("You are not assigned to this event");
            }
        }
    }

    private void validateGalleryManagementAccess(Gallery gallery) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER) {
            throw new ForbiddenException("Customers cannot modify gallery settings");
        }
        if (currentUser.getRole() == Role.PHOTOGRAPHER) {
            boolean isAssigned = gallery.getBooking().getAssignments().stream()
                    .anyMatch(a -> a.getPhotographer().getId().equals(currentUser.getId()));
            if (!isAssigned) {
                throw new ForbiddenException("You are not assigned to manage this gallery");
            }
        }
    }

    public GalleryResponse mapToResponse(Gallery g, boolean includePhotos) {
        List<PhotoResponse> photos = null;
        int count = (int) photoRepository.countByGalleryId(g.getId());

        if (includePhotos) {
            photos = photoRepository.findByGalleryIdOrderByUploadedAtAsc(g.getId()).stream()
                    .map(this::mapToPhotoResponse)
                    .toList();
        }

        return GalleryResponse.builder()
                .id(g.getId())
                .bookingId(g.getBooking().getId())
                .bookingRef(g.getBooking().getBookingRef())
                .customerName(g.getBooking().getCustomer().getFullName())
                .title(g.getTitle())
                .accessCode(g.getAccessCode())
                .status(g.getStatus())
                .coverPhotoId(g.getCoverPhotoId())
                .proofSelectionEnabled(g.isProofSelectionEnabled())
                .proofDeadline(g.getProofDeadline())
                .publishedAt(g.getPublishedAt())
                .photoCount(count)
                .photos(photos)
                .createdAt(g.getCreatedAt())
                .build();
    }

    public PhotoResponse mapToPhotoResponse(Photo p) {
        return PhotoResponse.builder()
                .id(p.getId())
                .galleryId(p.getGallery().getId())
                .fileName(p.getFileName())
                .originalFileName(p.getOriginalFileName())
                .fileSize(p.getFileSize())
                .contentType(p.getContentType())
                .caption(p.getCaption())
                .selectedProof(p.isSelectedProof())
                .cover(p.isCover())
                .uploadedAt(p.getUploadedAt())
                .build();
    }
}

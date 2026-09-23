package com.snapflow.controller;

import com.snapflow.dto.request.GalleryCreateRequest;
import com.snapflow.dto.request.GalleryUpdateRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.GalleryResponse;
import com.snapflow.dto.response.PhotoResponse;
import com.snapflow.service.GalleryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/galleries")
@RequiredArgsConstructor
@Tag(name = "Galleries", description = "Photo delivery, proof selection, and client gallery management")
public class GalleryController {

    private final GalleryService galleryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('PHOTOGRAPHER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Create gallery for an eligible booking")
    public ResponseEntity<ApiResponse<GalleryResponse>> createGallery(@Valid @RequestBody GalleryCreateRequest request) {
        GalleryResponse response = galleryService.createGallery(request);
        return new ResponseEntity<>(ApiResponse.success("Gallery created", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHOTOGRAPHER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Update gallery properties")
    public ResponseEntity<ApiResponse<GalleryResponse>> updateGallery(@PathVariable Long id, @Valid @RequestBody GalleryUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Gallery updated", galleryService.updateGallery(id, request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get gallery by ID (Authenticated)")
    public ResponseEntity<ApiResponse<GalleryResponse>> getGalleryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(galleryService.getGalleryById(id)));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get gallery by booking ID")
    public ResponseEntity<ApiResponse<GalleryResponse>> getGalleryByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success(galleryService.getGalleryByBookingId(bookingId)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get authenticated customer's galleries")
    public ResponseEntity<ApiResponse<Page<GalleryResponse>>> getMyGalleries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(galleryService.getMyCustomerGalleries(PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "List all galleries (Staff)")
    public ResponseEntity<ApiResponse<Page<GalleryResponse>>> getAllGalleries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(galleryService.getAllGalleries(PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/public/{accessCode}")
    @Operation(summary = "View public published gallery with access code")
    public ResponseEntity<ApiResponse<GalleryResponse>> getPublicGallery(@PathVariable String accessCode) {
        return ResponseEntity.ok(ApiResponse.success(galleryService.getPublicGalleryByAccessCode(accessCode)));
    }

    /*
     * Public, access-code scoped media routes.
     *
     * A browser <img> tag cannot attach a Bearer token, and the authenticated
     * stream/zip routes below sit behind the security filter chain. These two
     * endpoints live under /galleries/public/** (permitted anonymously) and the
     * service layer still validates the access code against a PUBLISHED gallery.
     */
    @GetMapping("/public/{accessCode}/photos/{photoId}/stream")
    @Operation(summary = "Stream a photo using a published gallery access code")
    public ResponseEntity<Resource> streamPublicPhoto(
            @PathVariable String accessCode,
            @PathVariable Long photoId
    ) {
        Resource resource = galleryService.streamPhotoSecurely(photoId, accessCode);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }

    @GetMapping("/public/{accessCode}/zip")
    @Operation(summary = "Download a published gallery as ZIP using its access code")
    public ResponseEntity<byte[]> downloadPublicGalleryZip(@PathVariable String accessCode) {
        GalleryResponse gallery = galleryService.getPublicGalleryByAccessCode(accessCode);
        byte[] zipBytes = galleryService.downloadGalleryZip(gallery.getId(), accessCode);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=snapflow_gallery_" + gallery.getId() + ".zip")
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(zipBytes);
    }

    @PostMapping(value = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('PHOTOGRAPHER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Multi-file photo upload")
    public ResponseEntity<ApiResponse<List<PhotoResponse>>> uploadPhotos(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files
    ) {
        List<PhotoResponse> photos = galleryService.uploadPhotos(id, files);
        return new ResponseEntity<>(ApiResponse.success("Photos uploaded successfully", photos), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}/photos/{photoId}")
    @PreAuthorize("hasAnyRole('PHOTOGRAPHER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Delete photo from gallery")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(@PathVariable Long id, @PathVariable Long photoId) {
        galleryService.deletePhoto(id, photoId);
        return ResponseEntity.ok(ApiResponse.success("Photo deleted", null));
    }

    @PatchMapping("/{id}/photos/{photoId}/caption")
    @PreAuthorize("hasAnyRole('PHOTOGRAPHER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Update photo caption")
    public ResponseEntity<ApiResponse<PhotoResponse>> updateCaption(
            @PathVariable Long id,
            @PathVariable Long photoId,
            @RequestParam String caption
    ) {
        return ResponseEntity.ok(ApiResponse.success("Caption updated", galleryService.updatePhotoCaption(id, photoId, caption)));
    }

    @PatchMapping("/{id}/photos/{photoId}/proof")
    @Operation(summary = "Customer proof selection toggle")
    public ResponseEntity<ApiResponse<Void>> toggleProof(
            @PathVariable Long id,
            @PathVariable Long photoId,
            @RequestParam boolean selected
    ) {
        galleryService.toggleProofSelection(id, photoId, selected);
        return ResponseEntity.ok(ApiResponse.success("Proof selection updated", null));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('PHOTOGRAPHER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Publish gallery to client")
    public ResponseEntity<ApiResponse<Void>> publishGallery(@PathVariable Long id) {
        galleryService.updateGallery(id, new GalleryUpdateRequest() {{ setStatus(com.snapflow.enums.GalleryStatus.PUBLISHED); }});
        return ResponseEntity.ok(ApiResponse.success("Gallery published", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    @Operation(summary = "Delete gallery and all its photos permanently")
    public ResponseEntity<ApiResponse<Void>> deleteGallery(@PathVariable Long id) {
        galleryService.deleteGallery(id);
        return ResponseEntity.ok(ApiResponse.success("Gallery deleted", null));
    }


    @GetMapping("/photos/{photoId}/stream")
    @Operation(summary = "Securely stream photo image content")
    public ResponseEntity<Resource> streamPhoto(
            @PathVariable Long photoId,
            @RequestParam(required = false) String accessCode
    ) {
        Resource resource = galleryService.streamPhotoSecurely(photoId, accessCode);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }

    @GetMapping("/{id}/zip")
    @Operation(summary = "Download whole gallery as ZIP archive")
    public ResponseEntity<byte[]> downloadGalleryZip(
            @PathVariable Long id,
            @RequestParam(required = false) String accessCode
    ) {
        byte[] zipBytes = galleryService.downloadGalleryZip(id, accessCode);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=snapflow_gallery_" + id + ".zip")
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(zipBytes);
    }
}

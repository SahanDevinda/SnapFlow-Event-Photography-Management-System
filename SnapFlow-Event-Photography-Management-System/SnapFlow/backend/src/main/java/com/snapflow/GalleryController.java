package com.snapflow.controller;

import com.snapflow.dto.response.ApiResponse;
import com.snapflow.dto.response.GalleryResponse;
import com.snapflow.service.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/galleries")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('PHOTOGRAPHER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<GalleryResponse>> create(@RequestBody Map<String, Object> body) {
        Long bookingId = Long.valueOf(body.get("bookingId").toString());
        String title = body.get("title") != null ? body.get("title").toString() : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Gallery created", galleryService.createGallery(bookingId, title)));
    }

    @PostMapping("/{id}/photos")
    @PreAuthorize("hasAnyRole('PHOTOGRAPHER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<GalleryResponse>> addPhoto(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Photo added",
                galleryService.addPhoto(id, body.get("fileName"), body.get("filePath"), body.get("caption"))));
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('PHOTOGRAPHER', 'OPERATIONS_MANAGER', 'COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<GalleryResponse>> publish(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Gallery published", galleryService.publish(id)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GalleryResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(galleryService.getById(id)));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<GalleryResponse>> getByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.ok(galleryService.getByBooking(bookingId)));
    }

    @GetMapping("/access/{code}")
    public ResponseEntity<ApiResponse<GalleryResponse>> getByAccessCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.ok(galleryService.getByAccessCode(code)));
    }
}

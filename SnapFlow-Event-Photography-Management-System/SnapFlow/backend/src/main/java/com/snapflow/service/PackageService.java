package com.snapflow.service;

import com.snapflow.dto.request.PackageRequest;
import com.snapflow.dto.response.PackageResponse;
import com.snapflow.entity.Package;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageService {

    private final PackageRepository packageRepository;
    private final ActivityLogService activityLogService;

    public List<PackageResponse> getAllActive() {
        return packageRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PackageResponse> getAll() {
        return packageRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PackageResponse getById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));
        return toResponse(pkg);
    }

    @Transactional
    public PackageResponse create(PackageRequest request, Long adminId) {
        Package pkg = Package.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .durationHours(request.getDurationHours())
                .features(request.getFeatures())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        pkg = packageRepository.save(pkg);
        activityLogService.log(adminId, "CREATE_PACKAGE", "PACKAGE", pkg.getId(), "Created package: " + pkg.getName());
        return toResponse(pkg);
    }

    @Transactional
    public PackageResponse update(Long id, PackageRequest request, Long adminId) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));

        pkg.setName(request.getName());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDurationHours(request.getDurationHours());
        pkg.setFeatures(request.getFeatures());
        if (request.getIsActive() != null) {
            pkg.setIsActive(request.getIsActive());
        }

        pkg = packageRepository.save(pkg);
        activityLogService.log(adminId, "UPDATE_PACKAGE", "PACKAGE", pkg.getId(), "Updated package: " + pkg.getName());
        return toResponse(pkg);
    }

    @Transactional
    public void deactivate(Long id, Long adminId) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));
        pkg.setIsActive(false);
        packageRepository.save(pkg);
        activityLogService.log(adminId, "DEACTIVATE_PACKAGE", "PACKAGE", id, "Deactivated package: " + pkg.getName());
    }

    public Package getEntityById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));
    }

    private PackageResponse toResponse(Package pkg) {
        return PackageResponse.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .description(pkg.getDescription())
                .price(pkg.getPrice())
                .durationHours(pkg.getDurationHours())
                .features(pkg.getFeatures())
                .isActive(pkg.getIsActive())
                .createdAt(pkg.getCreatedAt())
                .build();
    }
}

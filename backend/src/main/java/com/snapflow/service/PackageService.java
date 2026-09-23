package com.snapflow.service;

import com.snapflow.dto.request.PackageRequest;
import com.snapflow.dto.response.PackageResponse;
import com.snapflow.entity.Package;
import com.snapflow.exception.ConflictException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PackageService {

    private final PackageRepository packageRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<PackageResponse> getActivePackages() {
        return packageRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PackageResponse> getAllPackages() {
        return packageRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PackageResponse getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));
        return mapToResponse(pkg);
    }

    @Transactional
    public PackageResponse createPackage(PackageRequest request) {
        String name = request.getName().trim();
        if (packageRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Package name already exists: " + name);
        }

        Package pkg = Package.builder()
                .name(name)
                .description(request.getDescription())
                .price(request.getPrice())
                .durationHours(request.getDurationHours())
                .features(request.getFeatures().trim())
                .category(request.getCategory().trim())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Package saved = packageRepository.save(pkg);
        auditService.log("PACKAGE_CREATE", "Created package: " + saved.getName());
        return mapToResponse(saved);
    }

    @Transactional
    public PackageResponse updatePackage(Long id, PackageRequest request) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));

        String name = request.getName().trim();
        if (packageRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException("Package name already exists: " + name);
        }

        pkg.setName(name);
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDurationHours(request.getDurationHours());
        pkg.setFeatures(request.getFeatures().trim());
        pkg.setCategory(request.getCategory().trim());
        if (request.getActive() != null) {
            pkg.setActive(request.getActive());
        }

        Package updated = packageRepository.save(pkg);
        auditService.log("PACKAGE_UPDATE", "Updated package: " + updated.getName());
        return mapToResponse(updated);
    }

    @Transactional
    public void deactivatePackage(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));
        pkg.setActive(false);
        packageRepository.save(pkg);
        auditService.log("PACKAGE_DEACTIVATE", "Soft-deactivated package: " + pkg.getName());
    }

    @Transactional
    public void reactivatePackage(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));
        pkg.setActive(true);
        packageRepository.save(pkg);
        auditService.log("PACKAGE_REACTIVATE", "Reactivated package: " + pkg.getName());
    }

    public PackageResponse mapToResponse(Package pkg) {
        return PackageResponse.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .description(pkg.getDescription())
                .price(pkg.getPrice())
                .durationHours(pkg.getDurationHours())
                .features(pkg.getFeatures())
                .category(pkg.getCategory())
                .active(pkg.isActive())
                .createdAt(pkg.getCreatedAt())
                .build();
    }
}

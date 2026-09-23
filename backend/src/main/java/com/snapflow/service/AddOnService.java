package com.snapflow.service;

import com.snapflow.dto.request.AddOnRequest;
import com.snapflow.dto.response.AddOnResponse;
import com.snapflow.entity.AddOn;
import com.snapflow.exception.ConflictException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.AddOnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddOnService {

    private final AddOnRepository addOnRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<AddOnResponse> getActiveAddOns() {
        return addOnRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AddOnResponse> getAllAddOns() {
        return addOnRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AddOnResponse getAddOnById(Long id) {
        AddOn addOn = addOnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AddOn", "id", id));
        return mapToResponse(addOn);
    }

    @Transactional
    public AddOnResponse createAddOn(AddOnRequest request) {
        String name = request.getName().trim();
        if (addOnRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Add-on name already exists: " + name);
        }

        AddOn addOn = AddOn.builder()
                .name(name)
                .description(request.getDescription())
                .price(request.getPrice())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        AddOn saved = addOnRepository.save(addOn);
        auditService.log("ADDON_CREATE", "Created add-on: " + saved.getName());
        return mapToResponse(saved);
    }

    @Transactional
    public AddOnResponse updateAddOn(Long id, AddOnRequest request) {
        AddOn addOn = addOnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AddOn", "id", id));

        String name = request.getName().trim();
        if (addOnRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException("Add-on name already exists: " + name);
        }

        addOn.setName(name);
        addOn.setDescription(request.getDescription());
        addOn.setPrice(request.getPrice());
        if (request.getActive() != null) {
            addOn.setActive(request.getActive());
        }

        AddOn updated = addOnRepository.save(addOn);
        auditService.log("ADDON_UPDATE", "Updated add-on: " + updated.getName());
        return mapToResponse(updated);
    }

    @Transactional
    public void deactivateAddOn(Long id) {
        AddOn addOn = addOnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AddOn", "id", id));
        addOn.setActive(false);
        addOnRepository.save(addOn);
        auditService.log("ADDON_DEACTIVATE", "Soft-deactivated add-on: " + addOn.getName());
    }

    @Transactional
    public void reactivateAddOn(Long id) {
        AddOn addOn = addOnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AddOn", "id", id));
        addOn.setActive(true);
        addOnRepository.save(addOn);
        auditService.log("ADDON_REACTIVATE", "Reactivated add-on: " + addOn.getName());
    }

    public AddOnResponse mapToResponse(AddOn a) {
        return AddOnResponse.builder()
                .id(a.getId())
                .name(a.getName())
                .description(a.getDescription())
                .price(a.getPrice())
                .active(a.isActive())
                .createdAt(a.getCreatedAt())
                .build();
    }
}

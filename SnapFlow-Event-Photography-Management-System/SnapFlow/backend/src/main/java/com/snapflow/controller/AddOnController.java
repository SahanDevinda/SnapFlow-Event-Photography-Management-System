package com.snapflow.controller;

import com.snapflow.dto.response.ApiResponse;
import com.snapflow.entity.AddOn;
import com.snapflow.repository.AddOnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addons")
@RequiredArgsConstructor
public class AddOnController {

    private final AddOnRepository addOnRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddOn>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(addOnRepository.findByIsActiveTrue()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('COMPANY_DIRECTOR', 'CUSTOMER_RELATIONS_OFFICER')")
    public ResponseEntity<ApiResponse<List<AddOn>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(addOnRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AddOn>> getById(@PathVariable Long id) {
        return addOnRepository.findById(id)
                .map(a -> ResponseEntity.ok(ApiResponse.ok(a)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<AddOn>> create(@RequestBody Map<String, Object> body) {
        AddOn addOn = AddOn.builder()
                .name(body.get("name").toString())
                .description(body.get("description") != null ? body.get("description").toString() : "")
                .price(new BigDecimal(body.get("price").toString()))
                .isActive(body.get("isActive") != null ? Boolean.parseBoolean(body.get("isActive").toString()) : true)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("AddOn created", addOnRepository.save(addOn)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<AddOn>> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return addOnRepository.findById(id).map(a -> {
            if (body.containsKey("name")) a.setName(body.get("name").toString());
            if (body.containsKey("description")) a.setDescription(body.get("description").toString());
            if (body.containsKey("price")) a.setPrice(new BigDecimal(body.get("price").toString()));
            if (body.containsKey("isActive")) a.setIsActive(Boolean.parseBoolean(body.get("isActive").toString()));
            return ResponseEntity.ok(ApiResponse.ok("AddOn updated", addOnRepository.save(a)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        return addOnRepository.findById(id).map(a -> {
            a.setIsActive(false);
            addOnRepository.save(a);
            return ResponseEntity.ok(ApiResponse.<Void>message("AddOn deactivated"));
        }).orElse(ResponseEntity.notFound().build());
    }
}


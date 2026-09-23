package com.snapflow.controller;

import com.snapflow.dto.request.SystemSettingRequest;
import com.snapflow.dto.response.ApiResponse;
import com.snapflow.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "System settings and company branding")
public class SystemSettingController {

    private final SystemSettingService settingService;

    @GetMapping("/public")
    @Operation(summary = "Get public company branding settings")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPublicSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingService.getAllSettingsMap()));
    }

    @GetMapping
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Get all system settings")
    public ResponseEntity<ApiResponse<Map<String, String>>> getAllSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingService.getAllSettingsMap()));
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Update or create system setting")
    public ResponseEntity<ApiResponse<Void>> saveSetting(@Valid @RequestBody SystemSettingRequest request) {
        settingService.saveSetting(request);
        return ResponseEntity.ok(ApiResponse.success("Setting saved", null));
    }

    @DeleteMapping("/{key}")
    @PreAuthorize("hasRole('COMPANY_DIRECTOR')")
    @Operation(summary = "Delete an obsolete system setting")
    public ResponseEntity<ApiResponse<Void>> deleteSetting(@PathVariable String key) {
        settingService.deleteSetting(key);
        return ResponseEntity.ok(ApiResponse.success("Setting deleted", null));
    }
}

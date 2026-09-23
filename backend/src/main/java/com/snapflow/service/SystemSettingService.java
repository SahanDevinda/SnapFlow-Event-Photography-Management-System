package com.snapflow.service;

import com.snapflow.dto.request.SystemSettingRequest;
import com.snapflow.entity.SystemSetting;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Map<String, String> getAllSettingsMap() {
        List<SystemSetting> settings = systemSettingRepository.findAll();
        Map<String, String> map = new HashMap<>();
        for (SystemSetting s : settings) {
            map.put(s.getSettingKey(), s.getSettingValue());
        }
        return map;
    }

    @Transactional(readOnly = true)
    public String getSetting(String key, String defaultValue) {
        return systemSettingRepository.findBySettingKey(key)
                .map(SystemSetting::getSettingValue)
                .orElse(defaultValue);
    }

    @Transactional
    public void saveSetting(SystemSettingRequest request) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(request.getSettingKey())
                .orElse(SystemSetting.builder()
                        .settingKey(request.getSettingKey())
                        .description(request.getDescription())
                        .build());

        setting.setSettingValue(request.getSettingValue());
        if (request.getDescription() != null) {
            setting.setDescription(request.getDescription());
        }
        systemSettingRepository.save(setting);
        auditService.log("SETTING_UPDATE", "Updated setting: " + request.getSettingKey());
    }

    /** Removes an obsolete setting entry entirely (rather than leaving a stale value). */
    @Transactional
    public void deleteSetting(String key) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting", "key", key));
        systemSettingRepository.delete(setting);
        auditService.log("SETTING_DELETE", "Deleted setting: " + key);
    }
}

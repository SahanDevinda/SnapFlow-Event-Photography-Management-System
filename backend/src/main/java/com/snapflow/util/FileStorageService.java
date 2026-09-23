package com.snapflow.util;

import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@Slf4j
public class FileStorageService {

    private final Path rootLocation;
    private final Path receiptsLocation;
    private final Path photosLocation;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private static final Set<String> ALLOWED_RECEIPT_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"
    );

    public FileStorageService(@Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.receiptsLocation = this.rootLocation.resolve("receipts");
        this.photosLocation = this.rootLocation.resolve("photos");
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.receiptsLocation);
            Files.createDirectories(this.photosLocation);
            log.info("Upload storage initialized at {}", this.rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize storage directories", e);
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    public String storeReceipt(MultipartFile file) {
        validateFile(file, ALLOWED_RECEIPT_TYPES, 15 * 1024 * 1024L); // 15MB limit
        return storeFileInDirectory(file, this.receiptsLocation);
    }

    public String storePhoto(MultipartFile file) {
        validateFile(file, ALLOWED_IMAGE_TYPES, 25 * 1024 * 1024L); // 25MB limit
        return storeFileInDirectory(file, this.photosLocation);
    }

    private String storeFileInDirectory(MultipartFile file, Path targetDir) {
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFilename.contains("..")) {
            throw new BadRequestException("Invalid filename with relative path traversal: " + originalFilename);
        }

        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }

        String uniqueFileName = UUID.randomUUID() + extension;
        Path targetPath = targetDir.resolve(uniqueFileName);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            return uniqueFileName;
        } catch (IOException e) {
            log.error("Failed to store file {}", originalFilename, e);
            throw new RuntimeException("Failed to store file", e);
        }
    }

    public Resource loadReceiptAsResource(String fileName) {
        return loadResourceFromPath(this.receiptsLocation.resolve(fileName));
    }

    public Resource loadPhotoAsResource(String fileName) {
        return loadResourceFromPath(this.photosLocation.resolve(fileName));
    }

    private Resource loadResourceFromPath(Path filePath) {
        try {
            Path normalized = filePath.normalize();
            if (!normalized.startsWith(this.rootLocation)) {
                throw new BadRequestException("Access denied: path traversal attempt");
            }
            Resource resource = new UrlResource(normalized.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found or not readable: " + filePath.getFileName());
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File not found: " + filePath.getFileName());
        }
    }

    public byte[] createZipArchive(Map<String, String> fileNameToOriginalNameMap) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            Set<String> addedNames = new HashSet<>();
            for (Map.Entry<String, String> entry : fileNameToOriginalNameMap.entrySet()) {
                String storedFileName = entry.getKey();
                String displayName = entry.getValue();

                Path filePath = this.photosLocation.resolve(storedFileName).normalize();
                if (Files.exists(filePath) && Files.isReadable(filePath)) {
                    // Prevent zip entry collisions
                    String uniqueDisplayName = displayName;
                    int counter = 1;
                    while (addedNames.contains(uniqueDisplayName)) {
                        int dot = displayName.lastIndexOf('.');
                        if (dot > 0) {
                            uniqueDisplayName = displayName.substring(0, dot) + "_" + counter + displayName.substring(dot);
                        } else {
                            uniqueDisplayName = displayName + "_" + counter;
                        }
                        counter++;
                    }
                    addedNames.add(uniqueDisplayName);

                    ZipEntry zipEntry = new ZipEntry(uniqueDisplayName);
                    zos.putNextEntry(zipEntry);
                    Files.copy(filePath, zos);
                    zos.closeEntry();
                }
            }
            zos.finish();
            return baos.toByteArray();
        } catch (IOException e) {
            log.error("Failed to create ZIP archive", e);
            throw new RuntimeException("Failed to create ZIP archive", e);
        }
    }

    public void deletePhotoFile(String fileName) {
        try {
            Path path = this.photosLocation.resolve(fileName).normalize();
            if (path.startsWith(this.rootLocation)) {
                Files.deleteIfExists(path);
            }
        } catch (IOException e) {
            log.warn("Could not delete photo file: {}", fileName);
        }
    }

    private void validateFile(MultipartFile file, Set<String> allowedTypes, long maxSizeBytes) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }
        if (file.getSize() > maxSizeBytes) {
            throw new BadRequestException("File size exceeds maximum allowed limit (" + (maxSizeBytes / (1024 * 1024)) + "MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Unsupported file type: " + contentType + ". Allowed: " + allowedTypes);
        }
    }
}

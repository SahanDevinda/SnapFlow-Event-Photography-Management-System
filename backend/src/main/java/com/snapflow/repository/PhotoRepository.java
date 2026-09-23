package com.snapflow.repository;

import com.snapflow.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByGalleryIdOrderByUploadedAtAsc(Long galleryId);
    List<Photo> findByGalleryIdAndIsSelectedProofTrue(Long galleryId);
    long countByGalleryId(Long galleryId);
}

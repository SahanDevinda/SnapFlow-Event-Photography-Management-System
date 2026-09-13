package com.snapflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {

    List<Photo> findByGalleryId(Long galleryId);

    List<Photo> findByGalleryIdOrderByUploadedAtDesc(Long galleryId);
}

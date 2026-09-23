package com.snapflow.repository;

import com.snapflow.entity.Equipment;
import com.snapflow.enums.EquipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    Optional<Equipment> findBySerialNumberIgnoreCase(String serialNumber);
    boolean existsBySerialNumberIgnoreCase(String serialNumber);
    boolean existsBySerialNumberIgnoreCaseAndIdNot(String serialNumber, Long id);
    List<Equipment> findByStatus(EquipmentStatus status);
    Page<Equipment> findByStatus(EquipmentStatus status, Pageable pageable);
}

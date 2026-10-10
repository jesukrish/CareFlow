package com.careflow.forecast.repository;

import com.careflow.forecast.entity.SurgeAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurgeAlertRepository extends JpaRepository<SurgeAlert, Long> {
    List<SurgeAlert> findByActiveTrueOrderByCreatedAtDesc();
    List<SurgeAlert> findTop20ByOrderByCreatedAtDesc();
    List<SurgeAlert> findByDepartmentAndActiveTrue(String department);
}

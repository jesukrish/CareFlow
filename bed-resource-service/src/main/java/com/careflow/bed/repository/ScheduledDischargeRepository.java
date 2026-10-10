package com.careflow.bed.repository;

import com.careflow.bed.entity.ScheduledDischarge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduledDischargeRepository extends JpaRepository<ScheduledDischarge, Long> {
    List<ScheduledDischarge> findByDepartmentAndScheduledDate(String department, LocalDate scheduledDate);
    long countByDepartmentAndScheduledDate(String department, LocalDate scheduledDate);
    long countByDepartmentAndScheduledDateAndConfirmedFalse(String department, LocalDate scheduledDate);
}

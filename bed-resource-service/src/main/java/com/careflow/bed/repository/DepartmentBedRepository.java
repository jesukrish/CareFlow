package com.careflow.bed.repository;

import com.careflow.bed.entity.DepartmentBed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentBedRepository extends JpaRepository<DepartmentBed, Long> {
    Optional<DepartmentBed> findByDepartment(String department);
}

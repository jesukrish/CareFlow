package com.careflow.patient.repository;

import com.careflow.patient.entity.PatientVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PatientVisitRepository extends JpaRepository<PatientVisit, Long> {

    List<PatientVisit> findByDepartment(String department);

    List<PatientVisit> findByDepartmentAndVisitDateBetween(String department, LocalDate from, LocalDate to);

    @Query("SELECT pv.admissionDate, COUNT(pv) FROM PatientVisit pv " +
           "WHERE pv.department = :department " +
           "AND pv.admissionDate BETWEEN :from AND :to " +
           "AND pv.admissionDate IS NOT NULL " +
           "GROUP BY pv.admissionDate " +
           "ORDER BY pv.admissionDate")
    List<Object[]> countAdmissionsByDepartmentAndDateRange(
            @Param("department") String department,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT pv.dischargeDate, COUNT(pv) FROM PatientVisit pv " +
           "WHERE pv.department = :department " +
           "AND pv.dischargeDate BETWEEN :from AND :to " +
           "AND pv.dischargeDate IS NOT NULL " +
           "GROUP BY pv.dischargeDate " +
           "ORDER BY pv.dischargeDate")
    List<Object[]> countDischargesByDepartmentAndDateRange(
            @Param("department") String department,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT DISTINCT pv.department FROM PatientVisit pv ORDER BY pv.department")
    List<String> findDistinctDepartments();

    long countByDepartmentAndAdmissionDateAndDischargeDateIsNull(String department, LocalDate admissionDate);

    @Query("SELECT COUNT(pv) FROM PatientVisit pv " +
           "WHERE pv.department = :department " +
           "AND pv.admissionDate <= :date " +
           "AND (pv.dischargeDate IS NULL OR pv.dischargeDate > :date)")
    long countCurrentlyAdmitted(@Param("department") String department, @Param("date") LocalDate date);
}

package com.careflow.patient.service;

import com.careflow.patient.dto.AdmissionHistoryResponse;
import com.careflow.patient.dto.PatientVisitRequest;
import com.careflow.patient.dto.PatientVisitResponse;
import com.careflow.patient.entity.PatientVisit;
import com.careflow.patient.repository.PatientVisitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PatientVisitService {

    private static final Logger log = LoggerFactory.getLogger(PatientVisitService.class);
    private final PatientVisitRepository repository;

    public PatientVisitService(PatientVisitRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public PatientVisitResponse createVisit(PatientVisitRequest request) {
        PatientVisit entity = new PatientVisit();
        entity.setPatientToken(request.getPatientToken());
        entity.setDepartment(request.getDepartment());
        entity.setVisitDate(request.getVisitDate());
        entity.setAdmissionDate(request.getAdmissionDate());
        entity.setDischargeDate(request.getDischargeDate());
        entity.setVisitType(request.getVisitType().toUpperCase());
        entity.setDiagnosis(request.getDiagnosis());
        entity.setAgeGroup(request.getAgeGroup());
        entity.setGender(request.getGender());

        PatientVisit saved = repository.save(entity);
        log.info("Created patient visit: id={}, department={}, type={}", saved.getId(), saved.getDepartment(), saved.getVisitType());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PatientVisitResponse> getAllVisits() {
        return repository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PatientVisitResponse> getVisitsByDepartment(String department) {
        return repository.findByDepartment(department).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdmissionHistoryResponse> getAdmissionHistory(String department, LocalDate from, LocalDate to) {
        List<Object[]> admissions = repository.countAdmissionsByDepartmentAndDateRange(department, from, to);
        List<Object[]> discharges = repository.countDischargesByDepartmentAndDateRange(department, from, to);

        // Build discharge lookup
        Map<LocalDate, Long> dischargeLookup = new HashMap<>();
        for (Object[] row : discharges) {
            dischargeLookup.put((LocalDate) row[0], (Long) row[1]);
        }

        List<AdmissionHistoryResponse> result = new ArrayList<>();
        for (Object[] row : admissions) {
            LocalDate date = (LocalDate) row[0];
            long admCount = (Long) row[1];
            long disCount = dischargeLookup.getOrDefault(date, 0L);
            result.add(new AdmissionHistoryResponse(department, date, admCount, disCount));
        }

        // Add discharge-only dates
        for (Map.Entry<LocalDate, Long> entry : dischargeLookup.entrySet()) {
            boolean alreadyPresent = result.stream().anyMatch(r -> r.getDate().equals(entry.getKey()));
            if (!alreadyPresent) {
                result.add(new AdmissionHistoryResponse(department, entry.getKey(), 0, entry.getValue()));
            }
        }

        result.sort(Comparator.comparing(AdmissionHistoryResponse::getDate));
        return result;
    }

    @Transactional(readOnly = true)
    public List<String> getDepartments() {
        return repository.findDistinctDepartments();
    }

    @Transactional(readOnly = true)
    public long getCurrentlyAdmitted(String department, LocalDate date) {
        return repository.countCurrentlyAdmitted(department, date);
    }

    private PatientVisitResponse toResponse(PatientVisit entity) {
        PatientVisitResponse response = new PatientVisitResponse();
        response.setId(entity.getId());
        response.setPatientToken(entity.getPatientToken());
        response.setDepartment(entity.getDepartment());
        response.setVisitDate(entity.getVisitDate());
        response.setAdmissionDate(entity.getAdmissionDate());
        response.setDischargeDate(entity.getDischargeDate());
        response.setVisitType(entity.getVisitType());
        response.setDiagnosis(entity.getDiagnosis());
        response.setAgeGroup(entity.getAgeGroup());
        response.setGender(entity.getGender());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }
}

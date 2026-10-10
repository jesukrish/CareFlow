package com.careflow.patient.controller;

import com.careflow.patient.dto.AdmissionHistoryResponse;
import com.careflow.patient.dto.PatientVisitRequest;
import com.careflow.patient.dto.PatientVisitResponse;
import com.careflow.patient.service.PatientVisitService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientVisitController {

    private final PatientVisitService service;

    public PatientVisitController(PatientVisitService service) {
        this.service = service;
    }

    @GetMapping("/visits")
    public ResponseEntity<List<PatientVisitResponse>> getVisits(
            @RequestParam(required = false) String department) {
        if (department != null && !department.isBlank()) {
            return ResponseEntity.ok(service.getVisitsByDepartment(department));
        }
        return ResponseEntity.ok(service.getAllVisits());
    }

    @PostMapping("/visits")
    public ResponseEntity<PatientVisitResponse> createVisit(@Valid @RequestBody PatientVisitRequest request) {
        PatientVisitResponse created = service.createVisit(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/admissions/history")
    public ResponseEntity<List<AdmissionHistoryResponse>> getAdmissionHistory(
            @RequestParam String department,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(service.getAdmissionHistory(department, from, to));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<String>> getDepartments() {
        return ResponseEntity.ok(service.getDepartments());
    }

    @GetMapping("/admissions/current")
    public ResponseEntity<Long> getCurrentlyAdmitted(
            @RequestParam String department,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getCurrentlyAdmitted(department, date));
    }
}

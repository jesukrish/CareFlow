package com.careflow.forecast.controller;

import com.careflow.forecast.dto.*;
import com.careflow.forecast.entity.SurgeAlert;
import com.careflow.forecast.repository.SurgeAlertRepository;
import com.careflow.forecast.service.CapacityPlanningService;
import com.careflow.forecast.service.ForecastService;
import com.careflow.forecast.service.TriageService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final ForecastService forecastService;
    private final CapacityPlanningService capacityService;
    private final TriageService triageService;
    private final SurgeAlertRepository alertRepository;

    public AnalyticsController(ForecastService forecastService,
                               CapacityPlanningService capacityService,
                               TriageService triageService,
                               SurgeAlertRepository alertRepository) {
        this.forecastService = forecastService;
        this.capacityService = capacityService;
        this.triageService = triageService;
        this.alertRepository = alertRepository;
    }

    @GetMapping("/forecast")
    public ResponseEntity<ForecastResponse> getForecast(
            @RequestParam String department,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(forecastService.generateForecast(department, date));
    }

    @GetMapping("/capacity")
    public ResponseEntity<CapacityResponse> getCapacity(
            @RequestParam String department,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(capacityService.planCapacity(department, date));
    }

    @PostMapping("/triage")
    public ResponseEntity<TriageResponse> triage(@Valid @RequestBody TriageRequest request) {
        return ResponseEntity.ok(triageService.assessTriage(request));
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<AlertResponse>> getAlerts() {
        List<SurgeAlert> alerts = alertRepository.findTop20ByOrderByCreatedAtDesc();
        List<AlertResponse> response = alerts.stream().map(a -> {
            AlertResponse r = new AlertResponse();
            r.setId(a.getId());
            r.setDepartment(a.getDepartment());
            r.setAlertType(a.getAlertType());
            r.setSeverity(a.getSeverity());
            r.setMessage(a.getMessage());
            r.setActive(a.isActive());
            r.setCreatedAt(a.getCreatedAt());
            r.setResolvedAt(a.getResolvedAt());
            return r;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}

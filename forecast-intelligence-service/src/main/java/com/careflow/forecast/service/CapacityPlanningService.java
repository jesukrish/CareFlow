package com.careflow.forecast.service;

import com.careflow.forecast.dto.CapacityResponse;
import com.careflow.forecast.dto.CapacityResponse.StaffingRecommendation;
import com.careflow.forecast.dto.ForecastResponse;
import com.careflow.forecast.dto.ForecastResponse.ContributingFactor;
import com.careflow.forecast.entity.SurgeAlert;
import com.careflow.forecast.repository.SurgeAlertRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.*;

@Service
public class CapacityPlanningService {

    private static final Logger log = LoggerFactory.getLogger(CapacityPlanningService.class);
    private static final double NURSE_TO_PATIENT_RATIO = 0.25; // 1 nurse per 4 patients (general ward)
    private static final double SURGE_THRESHOLD = 0.85; // 85% occupancy = surge risk

    private final WebClient bedServiceClient;
    private final ForecastService forecastService;
    private final GeminiService geminiService;
    private final SurgeAlertRepository alertRepository;

    public CapacityPlanningService(@Qualifier("bedServiceClient") WebClient bedServiceClient,
                                   ForecastService forecastService,
                                   GeminiService geminiService,
                                   SurgeAlertRepository alertRepository) {
        this.bedServiceClient = bedServiceClient;
        this.forecastService = forecastService;
        this.geminiService = geminiService;
        this.alertRepository = alertRepository;
    }

    public CapacityResponse planCapacity(String department, LocalDate targetDate) {
        CapacityResponse response = new CapacityResponse();
        response.setDepartment(department);
        response.setTargetDate(targetDate);

        // 1. Get current occupancy from Bed Service
        Map<String, Object> occupancy = fetchOccupancy(department);
        if (occupancy == null) {
            throw new RuntimeException("Failed to retrieve occupancy data from Bed & Resource Service for " + department);
        }

        int totalBeds = ((Number) occupancy.get("totalBeds")).intValue();
        int currentOccupied = ((Number) occupancy.get("occupiedBeds")).intValue();
        int currentAvailable = ((Number) occupancy.get("availableBeds")).intValue();
        int icuTotal = ((Number) occupancy.getOrDefault("icuTotalBeds", 0)).intValue();
        int icuOccupied = ((Number) occupancy.getOrDefault("icuOccupiedBeds", 0)).intValue();

        response.setTotalBeds(totalBeds);
        response.setCurrentlyOccupied(currentOccupied);
        response.setCurrentlyAvailable(currentAvailable);
        response.setCurrentOccupancyRate(totalBeds > 0 ? Math.round((double) currentOccupied / totalBeds * 10000.0) / 100.0 : 0);
        response.setIcuTotalBeds(icuTotal);
        response.setIcuOccupied(icuOccupied);
        response.setIcuAvailable(icuTotal - icuOccupied);

        // 2. Get expected discharges from Bed Service
        Map<String, Object> availability = fetchAvailability(department, targetDate);
        int expectedDischarges = 0;
        if (availability != null) {
            expectedDischarges = ((Number) availability.getOrDefault("scheduledDischarges", 0)).intValue();
        }
        response.setExpectedDischarges(expectedDischarges);

        // 3. Get demand forecast
        ForecastResponse forecast = forecastService.generateForecast(department, targetDate);
        int predictedAdmissions = forecast.getPredictedAdmissions();
        response.setPredictedNewAdmissions(predictedAdmissions);

        // 4. Calculate projected occupancy
        // projectedOccupied = currentOccupied + newAdmissions - expectedDischarges
        int projectedOccupied = currentOccupied + predictedAdmissions - expectedDischarges;
        projectedOccupied = Math.max(0, projectedOccupied); // Can't go below 0
        int projectedAvailable = totalBeds - projectedOccupied;
        double projectedRate = totalBeds > 0 ? Math.round((double) projectedOccupied / totalBeds * 10000.0) / 100.0 : 0;

        response.setProjectedOccupied(projectedOccupied);
        response.setProjectedAvailable(projectedAvailable);
        response.setProjectedOccupancyRate(projectedRate);

        // 5. Calculate shortage
        int shortage = projectedAvailable < 0 ? Math.abs(projectedAvailable) : 0;
        response.setPotentialBedShortage(shortage);

        // 6. Risk assessment
        String riskLevel;
        boolean surgeRisk;
        if (projectedRate >= 95) {
            riskLevel = "CRITICAL";
            surgeRisk = true;
        } else if (projectedRate >= 85) {
            riskLevel = "HIGH";
            surgeRisk = true;
        } else if (projectedRate >= 75) {
            riskLevel = "MODERATE";
            surgeRisk = false;
        } else {
            riskLevel = "LOW";
            surgeRisk = false;
        }
        response.setRiskLevel(riskLevel);
        response.setSurgeRisk(surgeRisk);

        // 7. Staffing recommendation
        StaffingRecommendation staffing = new StaffingRecommendation();
        int currentStaff = (int) Math.ceil(currentOccupied * NURSE_TO_PATIENT_RATIO);
        int recommendedStaff = (int) Math.ceil(projectedOccupied * NURSE_TO_PATIENT_RATIO);
        // Add buffer for surge
        if (surgeRisk) {
            recommendedStaff = (int) Math.ceil(recommendedStaff * 1.2);
        }
        staffing.setCurrentStaffEstimate(currentStaff);
        staffing.setRecommendedStaff(recommendedStaff);
        staffing.setAdditionalStaffNeeded(Math.max(0, recommendedStaff - currentStaff));
        staffing.setRationale(String.format(
                "Based on 1:4 nurse-to-patient ratio. Current patients: %d, projected: %d.%s",
                currentOccupied, projectedOccupied,
                surgeRisk ? " Additional 20%% buffer added for surge risk." : ""));
        response.setStaffingRecommendation(staffing);

        // 8. Recommendations
        List<String> recommendations = new ArrayList<>();
        if (shortage > 0) {
            recommendations.add("CRITICAL: " + shortage + " bed shortage projected. Activate overflow protocols.");
            recommendations.add("Consider expediting " + Math.min(shortage + 2, expectedDischarges + 3) + " discharges where clinically appropriate.");
            recommendations.add("Coordinate with nearby facilities for patient transfers if needed.");
        }
        if (surgeRisk) {
            recommendations.add("Surge risk detected. Notify department heads and prepare contingency staffing.");
            recommendations.add("Review all scheduled admissions for potential deferral.");
        }
        if (staffing.getAdditionalStaffNeeded() > 0) {
            recommendations.add("Request " + staffing.getAdditionalStaffNeeded() + " additional nursing staff for " + targetDate + ".");
        }
        if (projectedRate >= 75 && projectedRate < 85) {
            recommendations.add("Monitor occupancy closely. Consider preemptive discharge planning.");
        }
        if (projectedRate < 75) {
            recommendations.add("Capacity is adequate. Continue standard operations.");
        }
        if (icuTotal > 0 && (double) icuOccupied / icuTotal >= 0.8) {
            recommendations.add("ICU utilization is high (" + icuOccupied + "/" + icuTotal + "). Prepare step-down beds.");
        }
        response.setRecommendations(recommendations);

        // 9. Contributing factors
        List<ContributingFactor> factors = new ArrayList<>();
        factors.add(new ContributingFactor("Current Occupancy",
                String.format("%d of %d beds occupied (%.1f%%)", currentOccupied, totalBeds, response.getCurrentOccupancyRate()),
                response.getCurrentOccupancyRate() > 80 ? "HIGH" : "MEDIUM"));
        factors.add(new ContributingFactor("Predicted Demand",
                String.format("%d new admissions predicted for %s", predictedAdmissions, targetDate),
                predictedAdmissions > 6 ? "HIGH" : "MEDIUM"));
        factors.add(new ContributingFactor("Expected Discharges",
                String.format("%d scheduled discharges on %s", expectedDischarges, targetDate),
                expectedDischarges > 0 ? "MEDIUM" : "LOW"));
        factors.add(new ContributingFactor("Department Capacity",
                String.format("Total capacity: %d beds (%d ICU)", totalBeds, icuTotal),
                "LOW"));
        if (forecast.isFallback()) {
            factors.add(new ContributingFactor("Data Limitation",
                    "Forecast uses fallback estimates: " + forecast.getFallbackReason(),
                    "HIGH"));
        }
        response.setContributingFactors(factors);

        // 10. Create alert if surge risk
        if (surgeRisk) {
            createSurgeAlert(department, riskLevel, projectedRate, shortage);
        }

        // 11. Gemini explanation
        try {
            String explanation = geminiService.explainCapacity(response);
            response.setGeminiExplanation(explanation);
        } catch (Exception e) {
            log.warn("Gemini capacity explanation failed: {}", e.getMessage());
            response.setGeminiExplanation(buildDeterministicCapacityExplanation(response));
        }

        return response;
    }

    private Map<String, Object> fetchOccupancy(String department) {
        try {
            return bedServiceClient.get()
                    .uri("/api/beds/occupancy?department={dept}", department)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch occupancy from Bed Service: {}", e.getMessage());
            return null;
        }
    }

    private Map<String, Object> fetchAvailability(String department, LocalDate date) {
        try {
            return bedServiceClient.get()
                    .uri("/api/beds/availability?department={dept}&date={date}", department, date)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch availability from Bed Service: {}", e.getMessage());
            return null;
        }
    }

    private void createSurgeAlert(String department, String severity, double occupancyRate, int shortage) {
        try {
            List<SurgeAlert> existing = alertRepository.findByDepartmentAndActiveTrue(department);
            if (!existing.isEmpty()) {
                return;
            }
            SurgeAlert alert = new SurgeAlert();
            alert.setDepartment(department);
            alert.setAlertType(shortage > 0 ? "CAPACITY_CRITICAL" : "SURGE_WARNING");
            alert.setSeverity(severity);
            alert.setMessage(String.format(
                    "%s: Projected occupancy %.1f%% for %s.%s",
                    department, occupancyRate, department,
                    shortage > 0 ? " Projected shortage of " + shortage + " beds." : " Surge threshold exceeded."));
            alert.setActive(true);
            alertRepository.save(alert);
        } catch (Exception e) {
            log.error("Failed to save surge alert: {}", e.getMessage());
        }
    }

    private String buildDeterministicCapacityExplanation(CapacityResponse r) {
        return String.format(
                "Capacity Analysis for %s on %s: Currently %d of %d beds occupied (%.1f%%). " +
                "With %d predicted admissions and %d expected discharges, projected occupancy is %d beds (%.1f%%). " +
                "Risk level: %s. %s",
                r.getDepartment(), r.getTargetDate(), r.getCurrentlyOccupied(), r.getTotalBeds(),
                r.getCurrentOccupancyRate(), r.getPredictedNewAdmissions(), r.getExpectedDischarges(),
                r.getProjectedOccupied(), r.getProjectedOccupancyRate(),
                r.getRiskLevel(),
                r.getPotentialBedShortage() > 0
                        ? "Action required: " + r.getPotentialBedShortage() + " bed shortage projected."
                        : "No bed shortage projected."
        );
    }
}

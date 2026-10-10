package com.careflow.forecast.dto;

import java.time.LocalDate;
import java.util.List;

public class CapacityResponse {

    private String department;
    private LocalDate targetDate;

    // Current state
    private int totalBeds;
    private int currentlyOccupied;
    private int currentlyAvailable;
    private double currentOccupancyRate;

    // Forecast
    private int predictedNewAdmissions;
    private int expectedDischarges;
    private int projectedOccupied;
    private int projectedAvailable;
    private double projectedOccupancyRate;

    // Risk
    private int potentialBedShortage;
    private String riskLevel; // LOW, MODERATE, HIGH, CRITICAL
    private boolean surgeRisk;

    // Staffing
    private StaffingRecommendation staffingRecommendation;

    // Recommendations
    private List<String> recommendations;
    private List<ForecastResponse.ContributingFactor> contributingFactors;

    // Gemini
    private String geminiExplanation;

    // ICU
    private int icuTotalBeds;
    private int icuOccupied;
    private int icuAvailable;

    public static class StaffingRecommendation {
        private int currentStaffEstimate;
        private int recommendedStaff;
        private int additionalStaffNeeded;
        private String rationale;

        public int getCurrentStaffEstimate() { return currentStaffEstimate; }
        public void setCurrentStaffEstimate(int currentStaffEstimate) { this.currentStaffEstimate = currentStaffEstimate; }
        public int getRecommendedStaff() { return recommendedStaff; }
        public void setRecommendedStaff(int recommendedStaff) { this.recommendedStaff = recommendedStaff; }
        public int getAdditionalStaffNeeded() { return additionalStaffNeeded; }
        public void setAdditionalStaffNeeded(int additionalStaffNeeded) { this.additionalStaffNeeded = additionalStaffNeeded; }
        public String getRationale() { return rationale; }
        public void setRationale(String rationale) { this.rationale = rationale; }
    }

    // Getters and Setters
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
    public int getTotalBeds() { return totalBeds; }
    public void setTotalBeds(int totalBeds) { this.totalBeds = totalBeds; }
    public int getCurrentlyOccupied() { return currentlyOccupied; }
    public void setCurrentlyOccupied(int currentlyOccupied) { this.currentlyOccupied = currentlyOccupied; }
    public int getCurrentlyAvailable() { return currentlyAvailable; }
    public void setCurrentlyAvailable(int currentlyAvailable) { this.currentlyAvailable = currentlyAvailable; }
    public double getCurrentOccupancyRate() { return currentOccupancyRate; }
    public void setCurrentOccupancyRate(double currentOccupancyRate) { this.currentOccupancyRate = currentOccupancyRate; }
    public int getPredictedNewAdmissions() { return predictedNewAdmissions; }
    public void setPredictedNewAdmissions(int predictedNewAdmissions) { this.predictedNewAdmissions = predictedNewAdmissions; }
    public int getExpectedDischarges() { return expectedDischarges; }
    public void setExpectedDischarges(int expectedDischarges) { this.expectedDischarges = expectedDischarges; }
    public int getProjectedOccupied() { return projectedOccupied; }
    public void setProjectedOccupied(int projectedOccupied) { this.projectedOccupied = projectedOccupied; }
    public int getProjectedAvailable() { return projectedAvailable; }
    public void setProjectedAvailable(int projectedAvailable) { this.projectedAvailable = projectedAvailable; }
    public double getProjectedOccupancyRate() { return projectedOccupancyRate; }
    public void setProjectedOccupancyRate(double projectedOccupancyRate) { this.projectedOccupancyRate = projectedOccupancyRate; }
    public int getPotentialBedShortage() { return potentialBedShortage; }
    public void setPotentialBedShortage(int potentialBedShortage) { this.potentialBedShortage = potentialBedShortage; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public boolean isSurgeRisk() { return surgeRisk; }
    public void setSurgeRisk(boolean surgeRisk) { this.surgeRisk = surgeRisk; }
    public StaffingRecommendation getStaffingRecommendation() { return staffingRecommendation; }
    public void setStaffingRecommendation(StaffingRecommendation staffingRecommendation) { this.staffingRecommendation = staffingRecommendation; }
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    public List<ForecastResponse.ContributingFactor> getContributingFactors() { return contributingFactors; }
    public void setContributingFactors(List<ForecastResponse.ContributingFactor> contributingFactors) { this.contributingFactors = contributingFactors; }
    public String getGeminiExplanation() { return geminiExplanation; }
    public void setGeminiExplanation(String geminiExplanation) { this.geminiExplanation = geminiExplanation; }
    public int getIcuTotalBeds() { return icuTotalBeds; }
    public void setIcuTotalBeds(int icuTotalBeds) { this.icuTotalBeds = icuTotalBeds; }
    public int getIcuOccupied() { return icuOccupied; }
    public void setIcuOccupied(int icuOccupied) { this.icuOccupied = icuOccupied; }
    public int getIcuAvailable() { return icuAvailable; }
    public void setIcuAvailable(int icuAvailable) { this.icuAvailable = icuAvailable; }
}

package com.careflow.forecast.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class ForecastResponse {

    private String department;
    private LocalDate targetDate;
    private int predictedAdmissions;
    private String forecastMethod;
    private int dataPointsUsed;
    private boolean isFallback;
    private String fallbackReason;
    private double confidenceLevel;
    private List<HistoricalDataPoint> historicalData;
    private List<ContributingFactor> contributingFactors;
    private String geminiExplanation;
    private String forecastHorizon;

    // Inner classes
    public static class HistoricalDataPoint {
        private LocalDate date;
        private int actualAdmissions;
        private String dayOfWeek;

        public HistoricalDataPoint() {}
        public HistoricalDataPoint(LocalDate date, int actualAdmissions, String dayOfWeek) {
            this.date = date;
            this.actualAdmissions = actualAdmissions;
            this.dayOfWeek = dayOfWeek;
        }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public int getActualAdmissions() { return actualAdmissions; }
        public void setActualAdmissions(int actualAdmissions) { this.actualAdmissions = actualAdmissions; }
        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    }

    public static class ContributingFactor {
        private String factor;
        private String description;
        private String impact; // HIGH, MEDIUM, LOW

        public ContributingFactor() {}
        public ContributingFactor(String factor, String description, String impact) {
            this.factor = factor;
            this.description = description;
            this.impact = impact;
        }

        public String getFactor() { return factor; }
        public void setFactor(String factor) { this.factor = factor; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getImpact() { return impact; }
        public void setImpact(String impact) { this.impact = impact; }
    }

    // Getters and Setters
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
    public int getPredictedAdmissions() { return predictedAdmissions; }
    public void setPredictedAdmissions(int predictedAdmissions) { this.predictedAdmissions = predictedAdmissions; }
    public String getForecastMethod() { return forecastMethod; }
    public void setForecastMethod(String forecastMethod) { this.forecastMethod = forecastMethod; }
    public int getDataPointsUsed() { return dataPointsUsed; }
    public void setDataPointsUsed(int dataPointsUsed) { this.dataPointsUsed = dataPointsUsed; }
    public boolean isFallback() { return isFallback; }
    public void setFallback(boolean fallback) { isFallback = fallback; }
    public String getFallbackReason() { return fallbackReason; }
    public void setFallbackReason(String fallbackReason) { this.fallbackReason = fallbackReason; }
    public double getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(double confidenceLevel) { this.confidenceLevel = confidenceLevel; }
    public List<HistoricalDataPoint> getHistoricalData() { return historicalData; }
    public void setHistoricalData(List<HistoricalDataPoint> historicalData) { this.historicalData = historicalData; }
    public List<ContributingFactor> getContributingFactors() { return contributingFactors; }
    public void setContributingFactors(List<ContributingFactor> contributingFactors) { this.contributingFactors = contributingFactors; }
    public String getGeminiExplanation() { return geminiExplanation; }
    public void setGeminiExplanation(String geminiExplanation) { this.geminiExplanation = geminiExplanation; }
    public String getForecastHorizon() { return forecastHorizon; }
    public void setForecastHorizon(String forecastHorizon) { this.forecastHorizon = forecastHorizon; }
}

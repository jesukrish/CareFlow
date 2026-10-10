package com.careflow.forecast.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "forecast_results")
public class ForecastResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Column(name = "predicted_admissions")
    private int predictedAdmissions;

    @Column(name = "forecast_method")
    private String forecastMethod;

    @Column(name = "confidence_level")
    private double confidenceLevel;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
    public int getPredictedAdmissions() { return predictedAdmissions; }
    public void setPredictedAdmissions(int predictedAdmissions) { this.predictedAdmissions = predictedAdmissions; }
    public String getForecastMethod() { return forecastMethod; }
    public void setForecastMethod(String forecastMethod) { this.forecastMethod = forecastMethod; }
    public double getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(double confidenceLevel) { this.confidenceLevel = confidenceLevel; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

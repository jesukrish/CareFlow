package com.careflow.forecast.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

public class TriageRequest {

    @NotBlank(message = "Department is required")
    private String department;

    private String ageGroup;
    private String gender;

    @NotNull(message = "At least one symptom is required")
    private List<String> symptoms;

    private Map<String, Double> vitalSigns; // e.g., heartRate, bloodPressure, temperature, oxygenSaturation, respiratoryRate

    private String chiefComplaint;

    // Getters and Setters
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getAgeGroup() { return ageGroup; }
    public void setAgeGroup(String ageGroup) { this.ageGroup = ageGroup; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public List<String> getSymptoms() { return symptoms; }
    public void setSymptoms(List<String> symptoms) { this.symptoms = symptoms; }
    public Map<String, Double> getVitalSigns() { return vitalSigns; }
    public void setVitalSigns(Map<String, Double> vitalSigns) { this.vitalSigns = vitalSigns; }
    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }
}

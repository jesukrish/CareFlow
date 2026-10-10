package com.careflow.patient.dto;

import java.time.LocalDate;

public class AdmissionHistoryResponse {

    private String department;
    private LocalDate date;
    private long admissionCount;
    private long dischargeCount;

    public AdmissionHistoryResponse() {}

    public AdmissionHistoryResponse(String department, LocalDate date, long admissionCount, long dischargeCount) {
        this.department = department;
        this.date = date;
        this.admissionCount = admissionCount;
        this.dischargeCount = dischargeCount;
    }

    // Getters and Setters
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public long getAdmissionCount() { return admissionCount; }
    public void setAdmissionCount(long admissionCount) { this.admissionCount = admissionCount; }

    public long getDischargeCount() { return dischargeCount; }
    public void setDischargeCount(long dischargeCount) { this.dischargeCount = dischargeCount; }
}

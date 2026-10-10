package com.careflow.bed.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class OccupancyUpdateRequest {

    @NotBlank(message = "Department is required")
    private String department;

    @Min(value = 0, message = "Total beds must be non-negative")
    private int totalBeds;

    @Min(value = 0, message = "Occupied beds must be non-negative")
    private int occupiedBeds;

    @Min(value = 0, message = "ICU total beds must be non-negative")
    private int icuTotalBeds;

    @Min(value = 0, message = "ICU occupied beds must be non-negative")
    private int icuOccupiedBeds;

    // Getters and Setters
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getTotalBeds() { return totalBeds; }
    public void setTotalBeds(int totalBeds) { this.totalBeds = totalBeds; }

    public int getOccupiedBeds() { return occupiedBeds; }
    public void setOccupiedBeds(int occupiedBeds) { this.occupiedBeds = occupiedBeds; }

    public int getIcuTotalBeds() { return icuTotalBeds; }
    public void setIcuTotalBeds(int icuTotalBeds) { this.icuTotalBeds = icuTotalBeds; }

    public int getIcuOccupiedBeds() { return icuOccupiedBeds; }
    public void setIcuOccupiedBeds(int icuOccupiedBeds) { this.icuOccupiedBeds = icuOccupiedBeds; }
}

package com.careflow.bed.dto;

import java.time.LocalDate;

public class AvailabilityResponse {

    private String department;
    private LocalDate date;
    private int totalBeds;
    private int currentlyOccupied;
    private int scheduledDischarges;
    private int projectedAvailable;

    // Getters and Setters
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public int getTotalBeds() { return totalBeds; }
    public void setTotalBeds(int totalBeds) { this.totalBeds = totalBeds; }

    public int getCurrentlyOccupied() { return currentlyOccupied; }
    public void setCurrentlyOccupied(int currentlyOccupied) { this.currentlyOccupied = currentlyOccupied; }

    public int getScheduledDischarges() { return scheduledDischarges; }
    public void setScheduledDischarges(int scheduledDischarges) { this.scheduledDischarges = scheduledDischarges; }

    public int getProjectedAvailable() { return projectedAvailable; }
    public void setProjectedAvailable(int projectedAvailable) { this.projectedAvailable = projectedAvailable; }
}

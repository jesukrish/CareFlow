package com.careflow.bed.dto;

public class OccupancyResponse {

    private String department;
    private int totalBeds;
    private int occupiedBeds;
    private int availableBeds;
    private int icuTotalBeds;
    private int icuOccupiedBeds;
    private int icuAvailableBeds;
    private double occupancyRate;

    // Getters and Setters
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getTotalBeds() { return totalBeds; }
    public void setTotalBeds(int totalBeds) { this.totalBeds = totalBeds; }

    public int getOccupiedBeds() { return occupiedBeds; }
    public void setOccupiedBeds(int occupiedBeds) { this.occupiedBeds = occupiedBeds; }

    public int getAvailableBeds() { return availableBeds; }
    public void setAvailableBeds(int availableBeds) { this.availableBeds = availableBeds; }

    public int getIcuTotalBeds() { return icuTotalBeds; }
    public void setIcuTotalBeds(int icuTotalBeds) { this.icuTotalBeds = icuTotalBeds; }

    public int getIcuOccupiedBeds() { return icuOccupiedBeds; }
    public void setIcuOccupiedBeds(int icuOccupiedBeds) { this.icuOccupiedBeds = icuOccupiedBeds; }

    public int getIcuAvailableBeds() { return icuAvailableBeds; }
    public void setIcuAvailableBeds(int icuAvailableBeds) { this.icuAvailableBeds = icuAvailableBeds; }

    public double getOccupancyRate() { return occupancyRate; }
    public void setOccupancyRate(double occupancyRate) { this.occupancyRate = occupancyRate; }
}

package com.careflow.bed.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "department_beds")
public class DepartmentBed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department", nullable = false, unique = true, length = 100)
    private String department;

    @Column(name = "total_beds", nullable = false)
    private int totalBeds;

    @Column(name = "occupied_beds", nullable = false)
    private int occupiedBeds;

    @Column(name = "icu_total_beds")
    private int icuTotalBeds;

    @Column(name = "icu_occupied_beds")
    private int icuOccupiedBeds;

    public int getAvailableBeds() {
        return totalBeds - occupiedBeds;
    }

    public int getIcuAvailableBeds() {
        return icuTotalBeds - icuOccupiedBeds;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

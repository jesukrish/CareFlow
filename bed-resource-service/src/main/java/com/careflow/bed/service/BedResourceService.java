package com.careflow.bed.service;

import com.careflow.bed.dto.AvailabilityResponse;
import com.careflow.bed.dto.OccupancyResponse;
import com.careflow.bed.dto.OccupancyUpdateRequest;
import com.careflow.bed.entity.DepartmentBed;
import com.careflow.bed.entity.Equipment;
import com.careflow.bed.repository.DepartmentBedRepository;
import com.careflow.bed.repository.EquipmentRepository;
import com.careflow.bed.repository.ScheduledDischargeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BedResourceService {

    private static final Logger log = LoggerFactory.getLogger(BedResourceService.class);

    private final DepartmentBedRepository bedRepository;
    private final ScheduledDischargeRepository dischargeRepository;
    private final EquipmentRepository equipmentRepository;

    public BedResourceService(DepartmentBedRepository bedRepository,
                              ScheduledDischargeRepository dischargeRepository,
                              EquipmentRepository equipmentRepository) {
        this.bedRepository = bedRepository;
        this.dischargeRepository = dischargeRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @Transactional(readOnly = true)
    public OccupancyResponse getOccupancy(String department) {
        DepartmentBed bed = bedRepository.findByDepartment(department)
                .orElseThrow(() -> new IllegalArgumentException("Department not found: " + department));
        return toOccupancyResponse(bed);
    }

    @Transactional(readOnly = true)
    public List<OccupancyResponse> getAllOccupancy() {
        return bedRepository.findAll().stream()
                .map(this::toOccupancyResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OccupancyResponse updateOccupancy(OccupancyUpdateRequest request) {
        // Validate consistency
        if (request.getOccupiedBeds() > request.getTotalBeds()) {
            throw new IllegalArgumentException(
                    "Occupied beds (" + request.getOccupiedBeds() +
                    ") cannot exceed total beds (" + request.getTotalBeds() + ")");
        }
        if (request.getIcuOccupiedBeds() > request.getIcuTotalBeds()) {
            throw new IllegalArgumentException(
                    "ICU occupied beds (" + request.getIcuOccupiedBeds() +
                    ") cannot exceed ICU total beds (" + request.getIcuTotalBeds() + ")");
        }

        DepartmentBed bed = bedRepository.findByDepartment(request.getDepartment())
                .orElse(new DepartmentBed());

        bed.setDepartment(request.getDepartment());
        bed.setTotalBeds(request.getTotalBeds());
        bed.setOccupiedBeds(request.getOccupiedBeds());
        bed.setIcuTotalBeds(request.getIcuTotalBeds());
        bed.setIcuOccupiedBeds(request.getIcuOccupiedBeds());

        DepartmentBed saved = bedRepository.save(bed);
        log.info("Updated occupancy for {}: {}/{} beds occupied", saved.getDepartment(), saved.getOccupiedBeds(), saved.getTotalBeds());
        return toOccupancyResponse(saved);
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse getAvailability(String department, LocalDate date) {
        DepartmentBed bed = bedRepository.findByDepartment(department)
                .orElseThrow(() -> new IllegalArgumentException("Department not found: " + department));

        long scheduledDischarges = dischargeRepository.countByDepartmentAndScheduledDate(department, date);

        AvailabilityResponse response = new AvailabilityResponse();
        response.setDepartment(department);
        response.setDate(date);
        response.setTotalBeds(bed.getTotalBeds());
        response.setCurrentlyOccupied(bed.getOccupiedBeds());
        response.setScheduledDischarges((int) scheduledDischarges);
        response.setProjectedAvailable(bed.getAvailableBeds() + (int) scheduledDischarges);
        return response;
    }

    @Transactional(readOnly = true)
    public List<Equipment> getResources() {
        return equipmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Equipment> getResourcesByDepartment(String department) {
        return equipmentRepository.findByDepartment(department);
    }

    private OccupancyResponse toOccupancyResponse(DepartmentBed bed) {
        OccupancyResponse r = new OccupancyResponse();
        r.setDepartment(bed.getDepartment());
        r.setTotalBeds(bed.getTotalBeds());
        r.setOccupiedBeds(bed.getOccupiedBeds());
        r.setAvailableBeds(bed.getAvailableBeds());
        r.setIcuTotalBeds(bed.getIcuTotalBeds());
        r.setIcuOccupiedBeds(bed.getIcuOccupiedBeds());
        r.setIcuAvailableBeds(bed.getIcuAvailableBeds());
        r.setOccupancyRate(bed.getTotalBeds() > 0
                ? Math.round((double) bed.getOccupiedBeds() / bed.getTotalBeds() * 10000.0) / 100.0
                : 0.0);
        return r;
    }
}

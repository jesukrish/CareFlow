package com.careflow.bed.controller;

import com.careflow.bed.dto.AvailabilityResponse;
import com.careflow.bed.dto.OccupancyResponse;
import com.careflow.bed.dto.OccupancyUpdateRequest;
import com.careflow.bed.entity.Equipment;
import com.careflow.bed.service.BedResourceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class BedResourceController {

    private final BedResourceService service;

    public BedResourceController(BedResourceService service) {
        this.service = service;
    }

    @GetMapping("/beds/occupancy")
    public ResponseEntity<?> getOccupancy(@RequestParam(required = false) String department) {
        if (department != null && !department.isBlank()) {
            return ResponseEntity.ok(service.getOccupancy(department));
        }
        return ResponseEntity.ok(service.getAllOccupancy());
    }

    @PostMapping("/beds/occupancy")
    public ResponseEntity<OccupancyResponse> updateOccupancy(@Valid @RequestBody OccupancyUpdateRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(service.updateOccupancy(request));
    }

    @GetMapping("/beds/availability")
    public ResponseEntity<AvailabilityResponse> getAvailability(
            @RequestParam String department,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getAvailability(department, date));
    }

    @GetMapping("/resources")
    public ResponseEntity<List<Equipment>> getResources(
            @RequestParam(required = false) String department) {
        if (department != null && !department.isBlank()) {
            return ResponseEntity.ok(service.getResourcesByDepartment(department));
        }
        return ResponseEntity.ok(service.getResources());
    }
}

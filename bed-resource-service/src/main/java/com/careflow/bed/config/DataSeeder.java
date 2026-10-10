package com.careflow.bed.config;

import com.careflow.bed.entity.DepartmentBed;
import com.careflow.bed.entity.Equipment;
import com.careflow.bed.entity.ScheduledDischarge;
import com.careflow.bed.repository.DepartmentBedRepository;
import com.careflow.bed.repository.EquipmentRepository;
import com.careflow.bed.repository.ScheduledDischargeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedBedData(DepartmentBedRepository bedRepo,
                                  EquipmentRepository equipRepo,
                                  ScheduledDischargeRepository dischargeRepo) {
        return args -> {
            if (bedRepo.count() > 0) {
                log.info("Bed data already seeded, skipping.");
                return;
            }

            log.info("Seeding bed and resource data...");
            Random random = new Random(42);

            // Department bed configurations
            String[][] deptConfig = {
                    // department, totalBeds, occupiedBeds, icuTotal, icuOccupied
                    {"General Medicine", "60", "48", "8", "6"},
                    {"Cardiology", "40", "34", "10", "8"},
                    {"Orthopedics", "35", "28", "4", "3"},
                    {"Pediatrics", "45", "32", "6", "4"},
                    {"Neurology", "30", "24", "8", "6"},
                    {"Oncology", "35", "29", "6", "5"}
            };

            List<DepartmentBed> beds = new ArrayList<>();
            for (String[] cfg : deptConfig) {
                DepartmentBed bed = new DepartmentBed();
                bed.setDepartment(cfg[0]);
                bed.setTotalBeds(Integer.parseInt(cfg[1]));
                bed.setOccupiedBeds(Integer.parseInt(cfg[2]));
                bed.setIcuTotalBeds(Integer.parseInt(cfg[3]));
                bed.setIcuOccupiedBeds(Integer.parseInt(cfg[4]));
                beds.add(bed);
            }
            bedRepo.saveAll(beds);

            // Equipment per department
            String[][] equipConfig = {
                    {"General Medicine", "Ventilator", "10", "4", "VENTILATOR"},
                    {"General Medicine", "Patient Monitor", "20", "8", "MONITOR"},
                    {"General Medicine", "Infusion Pump", "15", "6", "PUMP"},
                    {"Cardiology", "Ventilator", "12", "3", "VENTILATOR"},
                    {"Cardiology", "ECG Machine", "8", "5", "DIAGNOSTIC"},
                    {"Cardiology", "Defibrillator", "6", "4", "EMERGENCY"},
                    {"Orthopedics", "X-Ray Machine", "4", "2", "DIAGNOSTIC"},
                    {"Orthopedics", "Patient Monitor", "10", "5", "MONITOR"},
                    {"Pediatrics", "Ventilator", "8", "4", "VENTILATOR"},
                    {"Pediatrics", "Incubator", "6", "3", "SPECIALIZED"},
                    {"Neurology", "EEG Machine", "4", "2", "DIAGNOSTIC"},
                    {"Neurology", "Ventilator", "6", "2", "VENTILATOR"},
                    {"Oncology", "Infusion Pump", "12", "4", "PUMP"},
                    {"Oncology", "Patient Monitor", "10", "3", "MONITOR"}
            };

            List<Equipment> equipment = new ArrayList<>();
            for (String[] cfg : equipConfig) {
                Equipment eq = new Equipment();
                eq.setDepartment(cfg[0]);
                eq.setEquipmentName(cfg[1]);
                eq.setTotalCount(Integer.parseInt(cfg[2]));
                eq.setAvailableCount(Integer.parseInt(cfg[3]));
                eq.setEquipmentType(cfg[4]);
                equipment.add(eq);
            }
            equipRepo.saveAll(equipment);

            // Scheduled discharges for next 3 days
            LocalDate today = LocalDate.now();
            List<ScheduledDischarge> discharges = new ArrayList<>();
            for (String[] cfg : deptConfig) {
                String dept = cfg[0];
                for (int dayOffset = 0; dayOffset <= 3; dayOffset++) {
                    int count = 1 + random.nextInt(4);
                    for (int i = 0; i < count; i++) {
                        ScheduledDischarge sd = new ScheduledDischarge();
                        sd.setDepartment(dept);
                        sd.setPatientToken("PT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                        sd.setScheduledDate(today.plusDays(dayOffset));
                        sd.setConfirmed(random.nextBoolean());
                        discharges.add(sd);
                    }
                }
            }
            dischargeRepo.saveAll(discharges);

            log.info("Seeded {} department bed configs, {} equipment items, {} scheduled discharges",
                    beds.size(), equipment.size(), discharges.size());
        };
    }
}

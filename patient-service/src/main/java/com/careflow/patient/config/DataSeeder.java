package com.careflow.patient.config;

import com.careflow.patient.entity.PatientVisit;
import com.careflow.patient.repository.PatientVisitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private static final String[] DEPARTMENTS = {
            "General Medicine", "Cardiology", "Orthopedics",
            "Pediatrics", "Neurology", "Oncology"
    };

    private static final String[] DIAGNOSES_GENERAL = {
            "Acute Respiratory Infection", "Urinary Tract Infection", "Gastroenteritis",
            "Pneumonia", "Dehydration", "Fever of Unknown Origin", "Anemia", "Diabetes Management"
    };
    private static final String[] DIAGNOSES_CARDIO = {
            "Acute MI", "Heart Failure", "Atrial Fibrillation", "Hypertensive Crisis",
            "Angina Pectoris", "Cardiac Arrhythmia"
    };
    private static final String[] DIAGNOSES_ORTHO = {
            "Hip Fracture", "ACL Tear", "Spinal Stenosis", "Osteoarthritis",
            "Rotator Cuff Injury", "Fracture Repair"
    };
    private static final String[] DIAGNOSES_PEDS = {
            "Bronchiolitis", "Viral Infection", "Asthma Exacerbation", "Appendicitis",
            "Febrile Seizure", "Tonsillitis"
    };
    private static final String[] DIAGNOSES_NEURO = {
            "Stroke", "Epilepsy", "Migraine", "TBI",
            "Multiple Sclerosis Relapse", "Meningitis"
    };
    private static final String[] DIAGNOSES_ONCO = {
            "Chemotherapy Cycle", "Radiation Side Effects", "Cancer Staging Workup",
            "Immunotherapy Session", "Post-Surgical Recovery"
    };

    private static final String[] AGE_GROUPS = {"0-17", "18-34", "35-54", "55-74", "75+"};
    private static final String[] GENDERS = {"M", "F"};
    private static final String[] VISIT_TYPES = {"INPATIENT", "OUTPATIENT", "EMERGENCY"};

    @Bean
    CommandLineRunner seedData(PatientVisitRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                log.info("Database already seeded with {} records, skipping.", repository.count());
                return;
            }

            log.info("Seeding synthetic patient visit data...");
            Random random = new Random(42); // Reproducible seed
            List<PatientVisit> visits = new ArrayList<>();

            // Generate 90 days of historical data: 2026-07-13 to 2026-10-10
            LocalDate startDate = LocalDate.of(2026, 7, 13);
            LocalDate endDate = LocalDate.of(2026, 10, 10);

            for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                for (String dept : DEPARTMENTS) {
                    // Base admission rate varies by department and day of week
                    int baseRate = getBaseRate(dept);
                    int dayOfWeekFactor = getDayOfWeekFactor(date, random);
                    int admissionCount = Math.max(1, baseRate + dayOfWeekFactor + random.nextInt(3) - 1);

                    // Also add outpatient and emergency visits
                    int outpatientCount = baseRate * 2 + random.nextInt(5);
                    int emergencyCount = random.nextInt(3) + 1;

                    // Create inpatient admissions
                    for (int i = 0; i < admissionCount; i++) {
                        PatientVisit v = createVisit(dept, date, "INPATIENT", random, date);
                        // Length of stay: 1-14 days depending on department
                        int los = getLengthOfStay(dept, random);
                        LocalDate discharge = date.plusDays(los);
                        if (discharge.isBefore(endDate) || discharge.isEqual(endDate)) {
                            v.setDischargeDate(discharge);
                        }
                        visits.add(v);
                    }

                    // Create outpatient visits (no admission)
                    for (int i = 0; i < outpatientCount; i++) {
                        visits.add(createVisit(dept, date, "OUTPATIENT", random, null));
                    }

                    // Create emergency visits
                    for (int i = 0; i < emergencyCount; i++) {
                        PatientVisit ev = createVisit(dept, date, "EMERGENCY", random, date);
                        // 40% of emergency visits lead to admission
                        if (random.nextDouble() < 0.4) {
                            int los = getLengthOfStay(dept, random);
                            LocalDate discharge = date.plusDays(los);
                            if (discharge.isBefore(endDate) || discharge.isEqual(endDate)) {
                                ev.setDischargeDate(discharge);
                            }
                        } else {
                            ev.setAdmissionDate(null); // Not admitted
                        }
                        visits.add(ev);
                    }
                }
            }

            repository.saveAll(visits);
            log.info("Seeded {} synthetic patient visit records across {} departments.", visits.size(), DEPARTMENTS.length);
        };
    }

    private PatientVisit createVisit(String dept, LocalDate visitDate, String type, Random random, LocalDate admissionDate) {
        PatientVisit v = new PatientVisit();
        v.setPatientToken("PT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        v.setDepartment(dept);
        v.setVisitDate(visitDate);
        v.setVisitType(type);
        v.setAdmissionDate(admissionDate);
        v.setDiagnosis(getDiagnosis(dept, random));
        v.setAgeGroup(AGE_GROUPS[random.nextInt(AGE_GROUPS.length)]);
        v.setGender(GENDERS[random.nextInt(GENDERS.length)]);
        return v;
    }

    private int getBaseRate(String department) {
        return switch (department) {
            case "General Medicine" -> 8;
            case "Cardiology" -> 5;
            case "Orthopedics" -> 4;
            case "Pediatrics" -> 6;
            case "Neurology" -> 3;
            case "Oncology" -> 4;
            default -> 4;
        };
    }

    private int getDayOfWeekFactor(LocalDate date, Random random) {
        return switch (date.getDayOfWeek()) {
            case MONDAY -> 2;
            case TUESDAY -> 1;
            case WEDNESDAY -> 0;
            case THURSDAY -> 0;
            case FRIDAY -> -1;
            case SATURDAY -> -2;
            case SUNDAY -> -3;
        };
    }

    private int getLengthOfStay(String department, Random random) {
        return switch (department) {
            case "General Medicine" -> 2 + random.nextInt(5);    // 2-6 days
            case "Cardiology" -> 3 + random.nextInt(7);          // 3-9 days
            case "Orthopedics" -> 4 + random.nextInt(10);        // 4-13 days
            case "Pediatrics" -> 1 + random.nextInt(4);          // 1-4 days
            case "Neurology" -> 3 + random.nextInt(8);           // 3-10 days
            case "Oncology" -> 2 + random.nextInt(6);            // 2-7 days
            default -> 2 + random.nextInt(5);
        };
    }

    private String getDiagnosis(String department, Random random) {
        String[] pool = switch (department) {
            case "General Medicine" -> DIAGNOSES_GENERAL;
            case "Cardiology" -> DIAGNOSES_CARDIO;
            case "Orthopedics" -> DIAGNOSES_ORTHO;
            case "Pediatrics" -> DIAGNOSES_PEDS;
            case "Neurology" -> DIAGNOSES_NEURO;
            case "Oncology" -> DIAGNOSES_ONCO;
            default -> DIAGNOSES_GENERAL;
        };
        return pool[random.nextInt(pool.length)];
    }
}

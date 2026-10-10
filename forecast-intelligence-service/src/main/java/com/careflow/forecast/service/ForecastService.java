package com.careflow.forecast.service;

import com.careflow.forecast.dto.ForecastResponse;
import com.careflow.forecast.dto.ForecastResponse.ContributingFactor;
import com.careflow.forecast.dto.ForecastResponse.HistoricalDataPoint;
import com.careflow.forecast.entity.ForecastResult;
import com.careflow.forecast.repository.ForecastResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ForecastService {

    private static final Logger log = LoggerFactory.getLogger(ForecastService.class);
    private static final int LOOKBACK_DAYS = 60;
    private static final int MIN_DATA_POINTS = 7;

    private final WebClient patientServiceClient;
    private final ForecastResultRepository forecastRepository;
    private final GeminiService geminiService;

    public ForecastService(@Qualifier("patientServiceClient") WebClient patientServiceClient,
                           ForecastResultRepository forecastRepository,
                           GeminiService geminiService) {
        this.patientServiceClient = patientServiceClient;
        this.forecastRepository = forecastRepository;
        this.geminiService = geminiService;
    }

    public ForecastResponse generateForecast(String department, LocalDate targetDate) {
        ForecastResponse response = new ForecastResponse();
        response.setDepartment(department);
        response.setTargetDate(targetDate);
        response.setForecastHorizon("1-day");

        // Fetch historical admission data from Patient Service
        LocalDate from = targetDate.minusDays(LOOKBACK_DAYS);
        LocalDate to = targetDate.minusDays(1);

        List<Map<String, Object>> historicalData = fetchAdmissionHistory(department, from, to);

        if (historicalData == null || historicalData.isEmpty()) {
            return buildFallbackForecast(response, department, targetDate,
                    "Patient Service unavailable or no historical data found for department: " + department);
        }

        // Parse historical data
        List<HistoricalDataPoint> dataPoints = new ArrayList<>();
        Map<DayOfWeek, List<Integer>> dayOfWeekCounts = new EnumMap<>(DayOfWeek.class);

        for (Map<String, Object> record : historicalData) {
            LocalDate date = LocalDate.parse(record.get("date").toString());
            int admissions = ((Number) record.get("admissionCount")).intValue();
            String dow = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            dataPoints.add(new HistoricalDataPoint(date, admissions, dow));

            dayOfWeekCounts.computeIfAbsent(date.getDayOfWeek(), k -> new ArrayList<>()).add(admissions);
        }

        response.setHistoricalData(dataPoints);
        response.setDataPointsUsed(dataPoints.size());

        if (dataPoints.size() < MIN_DATA_POINTS) {
            return buildFallbackForecast(response, department, targetDate,
                    "Insufficient historical data: only " + dataPoints.size() + " data points available (minimum " + MIN_DATA_POINTS + " required)");
        }

        // Forecasting: Weighted combination of moving average and day-of-week average
        DayOfWeek targetDow = targetDate.getDayOfWeek();

        // 1. 7-day moving average
        List<Integer> recentValues = dataPoints.stream()
                .sorted(Comparator.comparing(HistoricalDataPoint::getDate).reversed())
                .limit(7)
                .map(HistoricalDataPoint::getActualAdmissions)
                .collect(Collectors.toList());
        double movingAvg7 = recentValues.stream().mapToInt(Integer::intValue).average().orElse(0);

        // 2. 14-day moving average
        List<Integer> recent14Values = dataPoints.stream()
                .sorted(Comparator.comparing(HistoricalDataPoint::getDate).reversed())
                .limit(14)
                .map(HistoricalDataPoint::getActualAdmissions)
                .collect(Collectors.toList());
        double movingAvg14 = recent14Values.stream().mapToInt(Integer::intValue).average().orElse(0);

        // 3. Day-of-week average
        List<Integer> dowValues = dayOfWeekCounts.getOrDefault(targetDow, Collections.emptyList());
        double dowAvg = dowValues.stream().mapToInt(Integer::intValue).average().orElse(movingAvg7);

        // Trend detection: compare recent 7d avg vs previous 7d avg
        double trendFactor = 1.0;
        if (recent14Values.size() >= 14) {
            double prev7Avg = recent14Values.subList(7, 14).stream().mapToInt(Integer::intValue).average().orElse(movingAvg7);
            if (prev7Avg > 0) {
                trendFactor = movingAvg7 / prev7Avg;
                // Cap the trend factor to avoid wild predictions
                trendFactor = Math.max(0.7, Math.min(1.3, trendFactor));
            }
        }

        // Weighted combination: 40% day-of-week, 40% 7-day MA, 20% 14-day MA, adjusted by trend
        double rawPrediction = (0.40 * dowAvg + 0.40 * movingAvg7 + 0.20 * movingAvg14) * trendFactor;
        int predicted = (int) Math.round(Math.max(1, rawPrediction));

        response.setPredictedAdmissions(predicted);
        response.setForecastMethod("Weighted ensemble: 40% day-of-week average + 40% 7-day MA + 20% 14-day MA with trend adjustment");
        response.setFallback(false);

        // Confidence level based on data sufficiency and variance
        double variance = computeVariance(recentValues, movingAvg7);
        double cv = movingAvg7 > 0 ? Math.sqrt(variance) / movingAvg7 : 1.0;
        double confidence = Math.max(0.3, Math.min(0.95, 1.0 - cv));
        response.setConfidenceLevel(Math.round(confidence * 100.0) / 100.0);

        // Contributing factors
        List<ContributingFactor> factors = new ArrayList<>();
        factors.add(new ContributingFactor("7-Day Moving Average",
                String.format("Average of last 7 days: %.1f admissions/day", movingAvg7), "HIGH"));
        factors.add(new ContributingFactor("Day-of-Week Pattern",
                String.format("%s average: %.1f admissions (based on %d historical %ss)",
                        targetDow.getDisplayName(TextStyle.FULL, Locale.ENGLISH), dowAvg,
                        dowValues.size(), targetDow.getDisplayName(TextStyle.FULL, Locale.ENGLISH)),
                dowValues.size() >= 4 ? "HIGH" : "MEDIUM"));
        factors.add(new ContributingFactor("Trend Direction",
                String.format("Trend factor: %.2f (%s)", trendFactor,
                        trendFactor > 1.05 ? "upward trend" : trendFactor < 0.95 ? "downward trend" : "stable"),
                Math.abs(trendFactor - 1.0) > 0.05 ? "MEDIUM" : "LOW"));
        factors.add(new ContributingFactor("Data Points",
                String.format("%d historical data points used from %d-day lookback window",
                        dataPoints.size(), LOOKBACK_DAYS),
                dataPoints.size() >= 30 ? "LOW" : "MEDIUM"));
        response.setContributingFactors(factors);

        // Persist forecast result
        persistForecast(department, targetDate, predicted, response.getForecastMethod(), confidence);

        // Get Gemini explanation
        try {
            String explanation = geminiService.explainForecast(response);
            response.setGeminiExplanation(explanation);
        } catch (Exception e) {
            log.warn("Gemini explanation failed, using fallback: {}", e.getMessage());
            response.setGeminiExplanation(buildDeterministicExplanation(response));
        }

        return response;
    }

    private List<Map<String, Object>> fetchAdmissionHistory(String department, LocalDate from, LocalDate to) {
        try {
            return patientServiceClient.get()
                    .uri("/api/patients/admissions/history?department={dept}&from={from}&to={to}",
                            department, from, to)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Patient Service returned error: {} {}", e.getStatusCode(), e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            log.error("Failed to fetch admission history from Patient Service: {}", e.getMessage());
            return null;
        }
    }

    private ForecastResponse buildFallbackForecast(ForecastResponse response, String department, LocalDate targetDate, String reason) {
        // Department-specific baseline estimates based on clinical literature
        int fallbackEstimate = switch (department) {
            case "General Medicine" -> 8;
            case "Cardiology" -> 5;
            case "Orthopedics" -> 4;
            case "Pediatrics" -> 6;
            case "Neurology" -> 3;
            case "Oncology" -> 4;
            default -> 5;
        };

        response.setPredictedAdmissions(fallbackEstimate);
        response.setForecastMethod("Fallback: department baseline estimate (no sufficient historical data)");
        response.setFallback(true);
        response.setFallbackReason(reason);
        response.setConfidenceLevel(0.20);
        response.setDataPointsUsed(0);
        response.setContributingFactors(List.of(
                new ContributingFactor("Fallback Estimate",
                        "Using department baseline of " + fallbackEstimate + " admissions/day due to: " + reason,
                        "LOW")
        ));
        response.setGeminiExplanation(buildDeterministicExplanation(response));
        return response;
    }

    private String buildDeterministicExplanation(ForecastResponse response) {
        StringBuilder sb = new StringBuilder();
        sb.append("Forecast Summary for ").append(response.getDepartment())
          .append(" on ").append(response.getTargetDate()).append(": ");
        sb.append("Predicted ").append(response.getPredictedAdmissions()).append(" new admissions. ");
        sb.append("Method: ").append(response.getForecastMethod()).append(". ");
        sb.append("Confidence: ").append(Math.round(response.getConfidenceLevel() * 100)).append("%. ");
        if (response.isFallback()) {
            sb.append("Note: This is a fallback estimate. ").append(response.getFallbackReason());
        }
        return sb.toString();
    }

    private void persistForecast(String department, LocalDate targetDate, int predicted, String method, double confidence) {
        try {
            ForecastResult result = new ForecastResult();
            result.setDepartment(department);
            result.setTargetDate(targetDate);
            result.setPredictedAdmissions(predicted);
            result.setForecastMethod(method);
            result.setConfidenceLevel(confidence);
            forecastRepository.save(result);
        } catch (Exception e) {
            log.error("Failed to persist forecast result: {}", e.getMessage());
        }
    }

    private double computeVariance(List<Integer> values, double mean) {
        if (values.isEmpty()) return 0;
        return values.stream()
                .mapToDouble(v -> Math.pow(v - mean, 2))
                .average()
                .orElse(0);
    }
}

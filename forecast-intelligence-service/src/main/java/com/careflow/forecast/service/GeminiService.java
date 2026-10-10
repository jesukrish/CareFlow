package com.careflow.forecast.service;

import com.careflow.forecast.dto.CapacityResponse;
import com.careflow.forecast.dto.ForecastResponse;
import com.careflow.forecast.dto.TriageRequest;
import com.careflow.forecast.dto.TriageResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${careflow.gemini.api-key:}")
    private String apiKey;

    @Value("${careflow.gemini.model:gemini-2.0-flash}")
    private String model;

    @Value("${careflow.gemini.timeout-seconds:30}")
    private int timeoutSeconds;

    private final WebClient geminiClient;

    public GeminiService(@Qualifier("geminiClient") WebClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    public String explainForecast(ForecastResponse forecast) {
        if (!isConfigured()) {
            return buildFallbackForecastExplanation(forecast);
        }

        String prompt = buildForecastPrompt(forecast);
        return callGemini(prompt, "forecast explanation");
    }

    public String explainCapacity(CapacityResponse capacity) {
        if (!isConfigured()) {
            return buildFallbackCapacityExplanation(capacity);
        }

        String prompt = buildCapacityPrompt(capacity);
        return callGemini(prompt, "capacity explanation");
    }

    public String explainTriage(TriageResponse triage, TriageRequest request) {
        if (!isConfigured()) {
            return triage.getExplanation();
        }

        String prompt = buildTriagePrompt(triage, request);
        return callGemini(prompt, "triage explanation");
    }

    private boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    private String callGemini(String prompt, String context) {
        try {
            String url = String.format(
                    "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    model, apiKey);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.3,
                            "maxOutputTokens", 500,
                            "topP", 0.8
                    )
            );

            Map response = geminiClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .block();

            if (response == null) {
                log.warn("Gemini returned null response for {}", context);
                return null;
            }

            // Parse response
            List<Map> candidates = (List<Map>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map content = (Map) candidates.get(0).get("content");
                if (content != null) {
                    List<Map> parts = (List<Map>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }

            log.warn("Unexpected Gemini response structure for {}", context);
            return null;

        } catch (WebClientResponseException e) {
            log.error("Gemini API error for {}: {} {}", context, e.getStatusCode(), e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            log.error("Gemini call failed for {}: {}", context, e.getMessage());
            return null;
        }
    }

    private String buildForecastPrompt(ForecastResponse forecast) {
        return String.format("""
                You are a hospital operations analyst assistant. Explain the following demand forecast in clear, actionable language for a hospital administrator. Do NOT invent any numbers or data — use only what is provided.

                Department: %s
                Target Date: %s
                Predicted Admissions: %d
                Forecast Method: %s
                Confidence Level: %.0f%%
                Data Points Used: %d
                Is Fallback: %s

                Contributing Factors:
                %s

                Provide a 2-3 sentence summary explaining what this forecast means operationally and any caveats the administrator should be aware of. Be concise and professional.""",
                forecast.getDepartment(), forecast.getTargetDate(),
                forecast.getPredictedAdmissions(), forecast.getForecastMethod(),
                forecast.getConfidenceLevel() * 100, forecast.getDataPointsUsed(),
                forecast.isFallback() ? "Yes - " + forecast.getFallbackReason() : "No",
                forecast.getContributingFactors() != null
                        ? forecast.getContributingFactors().stream()
                                .map(f -> "- " + f.getFactor() + ": " + f.getDescription())
                                .reduce("", (a, b) -> a + "\n" + b)
                        : "None"
        );
    }

    private String buildCapacityPrompt(CapacityResponse capacity) {
        return String.format("""
                You are a hospital operations analyst assistant. Summarize the following capacity analysis in clear, actionable language for a hospital administrator. Do NOT invent any numbers.

                Department: %s
                Target Date: %s
                Total Beds: %d
                Currently Occupied: %d (%.1f%%)
                Predicted New Admissions: %d
                Expected Discharges: %d
                Projected Occupied: %d (%.1f%%)
                Available After Projection: %d
                Potential Bed Shortage: %d
                Risk Level: %s
                Surge Risk: %s

                Recommendations: %s

                Provide a 3-4 sentence operational summary with the key action items. Be direct and professional.""",
                capacity.getDepartment(), capacity.getTargetDate(),
                capacity.getTotalBeds(), capacity.getCurrentlyOccupied(), capacity.getCurrentOccupancyRate(),
                capacity.getPredictedNewAdmissions(), capacity.getExpectedDischarges(),
                capacity.getProjectedOccupied(), capacity.getProjectedOccupancyRate(),
                capacity.getProjectedAvailable(), capacity.getPotentialBedShortage(),
                capacity.getRiskLevel(), capacity.isSurgeRisk() ? "Yes" : "No",
                capacity.getRecommendations() != null ? String.join("; ", capacity.getRecommendations()) : "None"
        );
    }

    private String buildTriagePrompt(TriageResponse triage, TriageRequest request) {
        return String.format("""
                You are a clinical decision-support assistant (DEMONSTRATION ONLY — not a validated clinical tool). Explain the following triage assessment in clear language. Do NOT make independent clinical decisions or invent data.

                Priority: Level %d - %s
                Symptoms: %s
                Rules Triggered: %s

                Provide a 2-3 sentence explanation of why this priority was assigned and what it means for clinical workflow. Include the disclaimer that this is a demonstration prototype.""",
                triage.getPriorityLevel(), triage.getPriorityCategory(),
                request.getSymptoms() != null ? String.join(", ", request.getSymptoms()) : "None provided",
                triage.getRulesTriggered() != null ? String.join("; ", triage.getRulesTriggered()) : "None"
        );
    }

    private String buildFallbackForecastExplanation(ForecastResponse forecast) {
        return String.format(
                "Forecast for %s on %s: %d admissions predicted using %s. Confidence: %.0f%%. %s" +
                " [Gemini API not configured — this is a deterministic fallback explanation.]",
                forecast.getDepartment(), forecast.getTargetDate(),
                forecast.getPredictedAdmissions(), forecast.getForecastMethod(),
                forecast.getConfidenceLevel() * 100,
                forecast.isFallback() ? "Note: This is a fallback estimate due to insufficient data." : ""
        );
    }

    private String buildFallbackCapacityExplanation(CapacityResponse capacity) {
        return String.format(
                "Capacity for %s on %s: %d/%d beds occupied (%.1f%%). Projected: %d occupied with %d new admissions and %d discharges. " +
                "Risk: %s.%s [Gemini API not configured — deterministic fallback.]",
                capacity.getDepartment(), capacity.getTargetDate(),
                capacity.getCurrentlyOccupied(), capacity.getTotalBeds(), capacity.getCurrentOccupancyRate(),
                capacity.getProjectedOccupied(), capacity.getPredictedNewAdmissions(), capacity.getExpectedDischarges(),
                capacity.getRiskLevel(),
                capacity.getPotentialBedShortage() > 0 ? " ALERT: " + capacity.getPotentialBedShortage() + " bed shortage projected." : ""
        );
    }
}

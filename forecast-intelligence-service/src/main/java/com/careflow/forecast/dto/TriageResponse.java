package com.careflow.forecast.dto;

import java.util.List;

public class TriageResponse {

    private String priorityCategory; // IMMEDIATE, EMERGENT, URGENT, LESS_URGENT, NON_URGENT
    private int priorityLevel; // 1-5
    private String priorityColor;
    private List<String> rulesTriggered;
    private List<ForecastResponse.ContributingFactor> contributingFactors;
    private String explanation;
    private String disclaimer;
    private String geminiExplanation;

    // Getters and Setters
    public String getPriorityCategory() { return priorityCategory; }
    public void setPriorityCategory(String priorityCategory) { this.priorityCategory = priorityCategory; }
    public int getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(int priorityLevel) { this.priorityLevel = priorityLevel; }
    public String getPriorityColor() { return priorityColor; }
    public void setPriorityColor(String priorityColor) { this.priorityColor = priorityColor; }
    public List<String> getRulesTriggered() { return rulesTriggered; }
    public void setRulesTriggered(List<String> rulesTriggered) { this.rulesTriggered = rulesTriggered; }
    public List<ForecastResponse.ContributingFactor> getContributingFactors() { return contributingFactors; }
    public void setContributingFactors(List<ForecastResponse.ContributingFactor> contributingFactors) { this.contributingFactors = contributingFactors; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
    public String getGeminiExplanation() { return geminiExplanation; }
    public void setGeminiExplanation(String geminiExplanation) { this.geminiExplanation = geminiExplanation; }
}

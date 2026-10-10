package com.careflow.forecast.repository;

import com.careflow.forecast.entity.ForecastResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForecastResultRepository extends JpaRepository<ForecastResult, Long> {
}

package com.example.schedules_service.service;

import com.example.schedules_service.dto.ScheduleRequest;
import com.example.schedules_service.dto.ScheduleResponse;

import java.util.List;

public interface ScheduleService {
    ScheduleResponse create(ScheduleRequest request);
    List<ScheduleResponse> getAll();
    ScheduleResponse getById(Long id);
    ScheduleResponse update(Long id, ScheduleRequest request);
    void delete(Long id);
}

package com.example.schedules_service.service.impl;

import com.example.schedules_service.dto.ScheduleRequest;
import com.example.schedules_service.dto.ScheduleResponse;
import com.example.schedules_service.entity.Schedule;
import com.example.schedules_service.exception.NotFoundException;
import com.example.schedules_service.repository.ScheduleRepository;
import com.example.schedules_service.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;

    @Override
    public ScheduleResponse create(ScheduleRequest request) {
        Schedule schedule = new Schedule();
        mapRequestToEntity(request, schedule);

        return mapToResponse(scheduleRepository.save(schedule));
    }

    @Override
    public List<ScheduleResponse> getAll() {
        return scheduleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ScheduleResponse getById(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule not found with id: " + id));
        return mapToResponse(schedule);
    }

    @Override
    public ScheduleResponse update(Long id, ScheduleRequest request) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule not found with id: " + id));

        // Cập nhật thông tin
        mapRequestToEntity(request, schedule);

        return mapToResponse(scheduleRepository.save(schedule));
    }

    @Override
    public void delete(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new NotFoundException("Schedule not found with id: " + id);
        }
        scheduleRepository.deleteById(id);
    }

    // Helper: Map Request -> Entity
    private void mapRequestToEntity(ScheduleRequest req, Schedule entity) {
        entity.setTrainRefId(req.getTrainRefId());
        entity.setTrainNumberSnapshot(req.getTrainNumberSnapshot());
        entity.setDepartureStationRefId(req.getDepartureStationRefId());
        entity.setDepartureStationNameSnapshot(req.getDepartureStationNameSnapshot());
        entity.setArrivalStationRefId(req.getArrivalStationRefId());
        entity.setArrivalStationNameSnapshot(req.getArrivalStationNameSnapshot());
        entity.setDepartureTime(req.getDepartureTime());
        entity.setArrivalTime(req.getArrivalTime());
        entity.setBasePrice(req.getBasePrice());
        
        // Set status with default value if null
        entity.setStatus(req.getStatus() != null ? req.getStatus() : Schedule.Status.scheduled);
    }

    // Helper: Map Entity -> Response
    private ScheduleResponse mapToResponse(Schedule entity) {
        ScheduleResponse res = new ScheduleResponse();
        res.setId(entity.getId());
        
        // Set both field names for backward compatibility
        res.setTrainNumber(entity.getTrainNumberSnapshot());
        res.setTrainNumberSnapshot(entity.getTrainNumberSnapshot());
        
        res.setDepartureStation(entity.getDepartureStationNameSnapshot());
        res.setDepartureStationNameSnapshot(entity.getDepartureStationNameSnapshot());
        
        res.setArrivalStation(entity.getArrivalStationNameSnapshot());
        res.setArrivalStationNameSnapshot(entity.getArrivalStationNameSnapshot());
        
        res.setDepartureTime(entity.getDepartureTime());
        res.setArrivalTime(entity.getArrivalTime());
        res.setBasePrice(entity.getBasePrice());
        res.setStatus(entity.getStatus());

        // Tính duration (phút)
        if (entity.getDepartureTime() != null && entity.getArrivalTime() != null) {
            res.setDurationMinutes(Duration.between(entity.getDepartureTime(), entity.getArrivalTime()).toMinutes());
        }

        return res;
    }
}

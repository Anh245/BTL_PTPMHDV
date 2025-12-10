package com.example.schedules_service.service.impl;

import com.example.schedules_service.dto.ScheduleRequest;
import com.example.schedules_service.dto.ScheduleResponse;
import com.example.schedules_service.entity.Schedule;
import com.example.schedules_service.exception.BadRequestException; // Import exception mới
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
        // Validation logic (Khớp với TC_4, TC_5, TC_6)
        validateScheduleRequest(request);

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

        // Validation logic khi update cũng cần thiết
        validateScheduleRequest(request);

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

    // --- Hàm Validation mới ---
    private void validateScheduleRequest(ScheduleRequest req) {
        // TC_4: Kiểm tra thời gian khởi hành
        if (req.getDepartureTime() == null) {
            throw new BadRequestException("Thời gian khởi hành không được bỏ trống");
        }

        // Kiểm tra thời gian đến (bắt buộc phải có để so sánh)
        if (req.getArrivalTime() == null) {
            throw new BadRequestException("Thời gian đến không được bỏ trống");
        }


        // TC_6: Logic thời gian (Đến phải sau Đi)
        if (!req.getArrivalTime().isAfter(req.getDepartureTime())) {
            throw new BadRequestException("Thời gian đến phải sau thời gian đi");
        }
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

        entity.setStatus(req.getStatus() != null ? req.getStatus() : Schedule.Status.scheduled);
    }

    // Helper: Map Entity -> Response
    private ScheduleResponse mapToResponse(Schedule entity) {
        ScheduleResponse res = new ScheduleResponse();
        res.setId(entity.getId());

        res.setTrainNumber(entity.getTrainNumberSnapshot());
        res.setTrainNumberSnapshot(entity.getTrainNumberSnapshot());

        res.setDepartureStation(entity.getDepartureStationNameSnapshot());
        res.setDepartureStationNameSnapshot(entity.getDepartureStationNameSnapshot());

        res.setArrivalStation(entity.getArrivalStationNameSnapshot());
        res.setArrivalStationNameSnapshot(entity.getArrivalStationNameSnapshot());

        res.setDepartureTime(entity.getDepartureTime());
        res.setArrivalTime(entity.getArrivalTime());
        res.setStatus(entity.getStatus());

        if (entity.getDepartureTime() != null && entity.getArrivalTime() != null) {
            res.setDurationMinutes(Duration.between(entity.getDepartureTime(), entity.getArrivalTime()).toMinutes());
        }

        return res;
    }
}
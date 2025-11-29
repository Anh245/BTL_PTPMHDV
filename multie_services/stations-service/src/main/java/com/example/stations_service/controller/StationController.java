package com.example.stations_service.controller;


import com.example.stations_service.dto.StationRequest;
import com.example.stations_service.dto.StationResponse;
import com.example.stations_service.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    @GetMapping
    public List<StationResponse> getAll() {
        return stationService.getAllStations();
    }

    @GetMapping("/{id}")
    public StationResponse getById(@PathVariable Long id) {
        return stationService.getStationById(id);
    }

    @PutMapping("/{id}")
    public StationResponse update(
            @PathVariable Long id,
            @RequestBody StationRequest request) {
        return stationService.updateStation(id, request);
    }

    @PostMapping
    public StationResponse create(@RequestBody StationRequest request) {
        return stationService.createStation(request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        stationService.deleteStation(id);
        return "Station deleted successfully";
    }

    @PatchMapping("/{id}/toggle")
    public StationResponse toggleActive(@PathVariable Long id) {
        return stationService.toggleActive(id);
    }
}
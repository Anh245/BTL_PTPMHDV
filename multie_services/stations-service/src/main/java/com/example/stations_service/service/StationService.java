package com.example.stations_service.service;


import com.example.stations_service.dto.StationRequest;
import com.example.stations_service.dto.StationResponse;

import java.util.List;

public interface StationService {
    List<StationResponse> getAllStations();
    StationResponse getStationById(Long id);
    StationResponse updateStation(Long id, StationRequest request);
    StationResponse createStation(StationRequest request);
    void deleteStation(Long id);
    StationResponse toggleActive(Long id);
}

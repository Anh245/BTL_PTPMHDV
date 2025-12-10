package com.example.stations_service.service.impl;

import com.example.stations_service.dto.StationRequest;
import com.example.stations_service.dto.StationResponse;
import com.example.stations_service.entity.Station;
import com.example.stations_service.exception.NotFoundException;
import com.example.stations_service.repository.StationRepository;
import com.example.stations_service.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StationServiceImpl implements StationService {

    private final StationRepository stationRepository;

    @Override
    public List<StationResponse> getAllStations() {
        return stationRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public StationResponse getStationById(Long id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Station not found"));
        return toResponse(station);
    }

    @Override
    public StationResponse updateStation(Long id, StationRequest request) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Station not found"));

        if (request.getName() != null) station.setName(request.getName());
        if (request.getAddress() != null) station.setAddress(request.getAddress());

        return toResponse(stationRepository.save(station));
    }

    @Override
    public StationResponse createStation(StationRequest request) {
        Station station = new Station();
        station.setName(request.getName());
        station.setAddress(request.getAddress());

        return toResponse(stationRepository.save(station));
    }

    @Override
    public void deleteStation(Long id) {
        if (!stationRepository.existsById(id)) {
            throw new NotFoundException("Cannot delete. Station not found with id: " + id);
        }
        stationRepository.deleteById(id);
    }

    @Override
    public StationResponse toggleActive(Long id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Station not found with id: " + id));

        station.setIsActive(!station.getIsActive());
        return toResponse(stationRepository.save(station));
    }

    private StationResponse toResponse(Station station) {
        StationResponse res = new StationResponse();
        res.setId(station.getId());
        res.setName(station.getName());
        res.setAddress(station.getAddress());
        res.setIsActive(station.getIsActive());
        return res;
    }
}
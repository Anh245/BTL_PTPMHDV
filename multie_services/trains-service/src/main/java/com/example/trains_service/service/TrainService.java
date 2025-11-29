package com.example.trains_service.service;

import com.example.trains_service.dto.TrainRequest;
import com.example.trains_service.dto.TrainResponse;
import com.example.trains_service.entity.Train;

import java.util.List;

public interface TrainService {
    TrainResponse create(TrainRequest request);
    List<TrainResponse> getAll();
    TrainResponse getById(Long id);
    TrainResponse update(Long id, TrainRequest request);
    void delete(Long id);
    TrainResponse updateStatus(Long id, Train.Status status);
}

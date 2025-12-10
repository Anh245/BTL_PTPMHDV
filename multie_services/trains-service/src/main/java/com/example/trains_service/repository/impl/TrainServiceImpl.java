package com.example.trains_service.repository.impl;

import com.example.trains_service.dto.TrainRequest;
import com.example.trains_service.dto.TrainResponse;
import com.example.trains_service.entity.Train;
import com.example.trains_service.exception.NotFoundException;
import com.example.trains_service.repository.TrainRepository;
import com.example.trains_service.service.TrainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainServiceImpl implements TrainService {

    private final TrainRepository trainRepository;

    @Override
    public TrainResponse create(TrainRequest request) {
        // Có thể check trùng trainNumber ở đây nếu cần
        Train train = new Train();
        train.setName(request.getName());
        train.setTrainNumber(request.getTrainNumber());
        train.setStatus(request.getStatus());

        Train savedTrain = trainRepository.save(train);
        return mapToResponse(savedTrain);
    }

    @Override
    public List<TrainResponse> getAll() {
        try {
            return trainRepository.findAll().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching trains: " + e.getMessage(), e);
        }
    }

    @Override
    public TrainResponse getById(Long id) {
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Train not found with id: " + id));
        return mapToResponse(train);
    }

    @Override
    public TrainResponse update(Long id, TrainRequest request) {
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Train not found with id: " + id));

        // Update fields
        if (request.getName() != null) train.setName(request.getName());
        if (request.getTrainNumber() != null) train.setTrainNumber(request.getTrainNumber());
        if (request.getStatus() != null) train.setStatus(request.getStatus());

        Train updatedTrain = trainRepository.save(train);
        return mapToResponse(updatedTrain);
    }

    @Override
    public void delete(Long id) {
        if (!trainRepository.existsById(id)) {
            throw new NotFoundException("Cannot delete. Train not found with id: " + id);
        }
        trainRepository.deleteById(id);
    }

    @Override
    public TrainResponse updateStatus(Long id, Train.Status status) {
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Train not found with id: " + id));

        train.setStatus(status);
        Train updatedTrain = trainRepository.save(train);
        return mapToResponse(updatedTrain);
    }

    // Hàm helper để convert Entity sang DTO Response
    private TrainResponse mapToResponse(Train train) {
        TrainResponse res = new TrainResponse();
        res.setId(train.getId());
        res.setName(train.getName());
        res.setTrainNumber(train.getTrainNumber());
        res.setTotalSeats(train.getTotalSeats());
        res.setStatus(train.getStatus());
        res.setCreatedAt(train.getCreatedAt());
        return res;
    }
}

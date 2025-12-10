package com.example.trains_service.dto;

import com.example.trains_service.entity.Train;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TrainResponse {
    private Long id;
    private String name;
    private String trainNumber;
    private Train.Status status;
    private LocalDateTime createdAt;
}

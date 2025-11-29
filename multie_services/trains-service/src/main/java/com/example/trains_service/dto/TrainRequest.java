package com.example.trains_service.dto;

import com.example.trains_service.entity.Train;
import lombok.Data;

@Data
public class TrainRequest {
    private String name;
    private String trainNumber;
    private Integer totalSeats; // Đã thêm trường này
    private Train.Status status;
}

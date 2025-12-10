package com.example.trains_service.dto;

import com.example.trains_service.entity.Train;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TrainRequest {
    @NotBlank(message = "Tên tàu không được bỏ trống")
    private String name;

    @NotBlank(message = "Số hiệu tàu không được bỏ trống")
    private String trainNumber;

    private Train.Status status;
}

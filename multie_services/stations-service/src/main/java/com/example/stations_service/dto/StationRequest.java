package com.example.stations_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StationRequest {
    @NotBlank(message = "Tên ga không được bỏ trống")
    private String name;

    @NotBlank(message = "Địa chỉ ga không được bỏ trống")
    private String address;
}

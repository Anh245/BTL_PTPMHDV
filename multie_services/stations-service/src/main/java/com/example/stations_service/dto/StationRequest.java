package com.example.stations_service.dto;

import lombok.Data;

@Data
public class StationRequest {
    private String name;
    private String address;
    private Boolean isActive;
}

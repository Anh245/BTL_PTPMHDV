package com.example.stations_service.controller;

import com.example.stations_service.dto.StationRequest;
import com.example.stations_service.dto.StationResponse;
import com.example.stations_service.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Đã thêm import
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    // 1. Get All - USER & ADMIN (Hoặc Public tùy nghiệp vụ)
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')") // Thêm quyền xem
    public ResponseEntity<List<StationResponse>> getAll() {
        return ResponseEntity.ok(stationService.getAllStations());
    }

    // 2. Get By ID - USER & ADMIN
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')") // Thêm quyền xem
    public ResponseEntity<StationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(stationService.getStationById(id));
    }

    // 3. Update - ADMIN ONLY
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN được sửa
    public ResponseEntity<StationResponse> update(
            @PathVariable Long id,
            @RequestBody StationRequest request) {
        return ResponseEntity.ok(stationService.updateStation(id, request));
    }

    // 4. Create - ADMIN ONLY
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN được tạo
    public ResponseEntity<StationResponse> create(@RequestBody StationRequest request) {
        return ResponseEntity.ok(stationService.createStation(request));
    }

    // 5. Delete - ADMIN ONLY
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN được xóa
    public ResponseEntity<String> delete(@PathVariable Long id) {
        stationService.deleteStation(id);
        return ResponseEntity.ok("Station deleted successfully");
    }

    // 6. Toggle Status - ADMIN ONLY
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN được đổi trạng thái
    public ResponseEntity<StationResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(stationService.toggleActive(id));
    }
}
package com.example.trains_service.controller;

import com.example.trains_service.dto.TrainRequest;
import com.example.trains_service.dto.TrainResponse;
import com.example.trains_service.entity.Train;
import com.example.trains_service.service.TrainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trains")
@RequiredArgsConstructor
public class TrainController {

    private final TrainService trainService;

    // 1. Create - ADMIN ONLY
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainResponse> create(@RequestBody TrainRequest request) {
        return ResponseEntity.ok(trainService.create(request));
    }

    // 2. Get All - ADMIN & USER
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<TrainResponse>> getAll() {
        return ResponseEntity.ok(trainService.getAll());
    }

    // 3. Get By ID - ADMIN & USER
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TrainResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(trainService.getById(id));
    }

    // 4. Update - ADMIN ONLY
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainResponse> update(@PathVariable Long id, @RequestBody TrainRequest request) {
        return ResponseEntity.ok(trainService.update(id, request));
    }

    // 5. Delete - ADMIN ONLY
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        trainService.delete(id);
        return ResponseEntity.ok("Train deleted successfully");
    }

    // 6. Update Status - ADMIN ONLY
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody String status // Nhận chuỗi: "active", "inactive", "maintenance"
    ) {
        // Convert string sang Enum, xử lý lỗi nếu string sai format
        try {
            Train.Status enumStatus = Train.Status.valueOf(status);
            return ResponseEntity.ok(trainService.updateStatus(id, enumStatus));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value. Allowed: active, inactive, maintenance");
        }
    }
}

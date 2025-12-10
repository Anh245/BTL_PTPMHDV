package com.example.schedules_service.controller;

import com.example.schedules_service.dto.ScheduleRequest;
import com.example.schedules_service.dto.ScheduleResponse;
import com.example.schedules_service.service.ScheduleService;
import jakarta.validation.Valid; // Bổ sung import này
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    // 1. CREATE - ADMIN ONLY
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    // Thêm @Valid để kích hoạt kiểm tra lỗi trong ScheduleRequest
    public ResponseEntity<ScheduleResponse> create(@Valid @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(scheduleService.create(request));
    }

    // 2. GET ALL - USER & ADMIN
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ScheduleResponse>> getAll() {
        return ResponseEntity.ok(scheduleService.getAll());
    }

    // 2.1. GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ScheduleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getById(id));
    }

    // 3. UPDATE - ADMIN ONLY
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    // Thêm @Valid ở đây nữa
    public ResponseEntity<ScheduleResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(scheduleService.update(id, request));
    }

    // 4. DELETE - ADMIN ONLY
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return ResponseEntity.ok("Schedule deleted successfully");
    }
}
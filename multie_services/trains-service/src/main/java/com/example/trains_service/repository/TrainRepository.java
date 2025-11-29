package com.example.trains_service.repository;

import com.example.trains_service.entity.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainRepository extends JpaRepository<Train, Long> {
    // Kiểm tra trùng mã tàu nếu cần
    boolean existsByTrainNumber(String trainNumber);
}

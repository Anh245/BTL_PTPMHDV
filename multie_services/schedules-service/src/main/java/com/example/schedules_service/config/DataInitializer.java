package com.example.schedules_service.config;

import com.example.schedules_service.entity.Schedule;
import com.example.schedules_service.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ScheduleRepository scheduleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (scheduleRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();

            // Chuyến 1: Nhổn -> Cầu Giấy (Tàu MN01)
            Schedule s1 = new Schedule();
            s1.setTrainRefId(1L); // ID giả định của tàu MN01
            s1.setTrainNumberSnapshot("MN01");
            s1.setDepartureStationRefId(1L); // ID giả định Ga Nhổn
            s1.setDepartureStationNameSnapshot("Ga Nhổn");
            s1.setArrivalStationRefId(8L); // ID giả định Ga Cầu Giấy
            s1.setArrivalStationNameSnapshot("Ga Cầu Giấy");
            s1.setDepartureTime(now.plusHours(1)); // Khởi hành sau 1h nữa
            s1.setArrivalTime(now.plusHours(1).plusMinutes(20));
            s1.setBasePrice(new BigDecimal("12000.00"));
            s1.setStatus(Schedule.Status.scheduled); //

            // Chuyến 2: Cầu Giấy -> Nhổn (Tàu MN01 quay đầu)
            Schedule s2 = new Schedule();
            s2.setTrainRefId(1L);
            s2.setTrainNumberSnapshot("MN01");
            s2.setDepartureStationRefId(8L); // Cầu Giấy
            s2.setDepartureStationNameSnapshot("Ga Cầu Giấy");
            s2.setArrivalStationRefId(1L); // Nhổn
            s2.setArrivalStationNameSnapshot("Ga Nhổn");
            s2.setDepartureTime(now.plusHours(2));
            s2.setArrivalTime(now.plusHours(2).plusMinutes(20));
            s2.setBasePrice(new BigDecimal("12000.00"));
            s2.setStatus(Schedule.Status.scheduled);

            // Chuyến 3: Nhổn -> ĐH Quốc Gia (Tàu MN02 - Chặng ngắn)
            Schedule s3 = new Schedule();
            s3.setTrainRefId(2L); // ID giả định tàu MN02
            s3.setTrainNumberSnapshot("MN02");
            s3.setDepartureStationRefId(1L);
            s3.setDepartureStationNameSnapshot("Ga Nhổn");
            s3.setArrivalStationRefId(6L); // ĐH Quốc Gia
            s3.setArrivalStationNameSnapshot("Ga ĐH Quốc Gia");
            s3.setDepartureTime(now.plusHours(3));
            s3.setArrivalTime(now.plusHours(3).plusMinutes(12));
            s3.setBasePrice(new BigDecimal("10000.00"));
            s3.setStatus(Schedule.Status.scheduled);

            scheduleRepository.saveAll(Arrays.asList(s1, s2, s3));
            System.out.println("Đã khởi tạo dữ liệu mẫu cho Schedules Service");
        }
    }
}
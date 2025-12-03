package com.example.trains_service.config;

import com.example.trains_service.entity.Train;
import com.example.trains_service.repository.TrainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final TrainRepository trainRepository;

    @Override
    public void run(String... args) throws Exception {
        if (trainRepository.count() == 0) {
            List<Train> trains = Arrays.asList(
                    createTrain("Metro 01", "MN01", 944, Train.Status.active),
                    createTrain("Metro 02", "MN02", 944, Train.Status.active),
                    createTrain("Metro 03", "MN03", 944, Train.Status.maintenance),
                    createTrain("Metro 04", "MN04", 944, Train.Status.inactive)
            );

            trainRepository.saveAll(trains);
            System.out.println("Đã khởi tạo dữ liệu mẫu cho Trains Service");
        }
    }

    private Train createTrain(String name, String trainNumber, Integer seats, Train.Status status) {
        Train train = new Train();
        train.setName(name);
        train.setTrainNumber(trainNumber);
        train.setTotalSeats(seats); //
        train.setStatus(status);
        return train;
    }
}
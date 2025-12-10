package com.example.tickets_service.dto;

import lombok.Data;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Data
public class TicketRequest {
    // Sửa message khớp với TC_2
    @NotNull(message = "Mã lịch trình không được bỏ trống")
    private Long scheduleRefId;

    // Sửa message khớp với TC_3
    @NotBlank(message = "Tên vé không được bỏ trống")
    @Size(max = 100, message = "Tên vé không được vượt quá 100 ký tự")
    private String name;

    // Sửa message khớp với TC_4
    @NotNull(message = "Giá vé không được bỏ trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá vé phải lớn hơn 0")
    private BigDecimal price;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;

    @NotNull(message = "Tổng số lượng là bắt buộc")
    @Min(value = 1, message = "Tổng số lượng phải ít nhất là 1")
    private Integer totalQuantity;

    private String status; // "active", "inactive", "sold_out"
}
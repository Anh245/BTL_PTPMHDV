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
    @NotNull(message = "Schedule reference is required")
    private Long scheduleRefId;
    @NotBlank(message = "Ticket name is required")
    @Size(max = 100, message = "Ticket name must not exceed 100 characters")
    private String name;
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    @NotNull(message = "Total quantity is required")
    @Min(value = 1, message = "Total quantity must be at least 1")
    private Integer totalQuantity;
    private String status; // "active", "inactive", "sold_out"
}

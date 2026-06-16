package br.com.emoney.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

public class TransferCoinsRequest {
    @NotNull
    private UUID studentId;

    @Positive
    private int quantidade;

    @NotBlank
    private String motivo;

    public UUID getStudentId() {
        return studentId;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public String getMotivo() {
        return motivo;
    }
}

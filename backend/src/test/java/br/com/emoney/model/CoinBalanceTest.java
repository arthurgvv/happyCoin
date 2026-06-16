package br.com.emoney.model;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CoinBalanceTest {

    @Test
    void professorDebitsCoinsWhenBalanceIsEnough() {
        Professor professor = new Professor(
                "Ana Souza",
                "12345678901",
                "ana@gmail.com",
                "senha123",
                UUID.randomUUID(),
                List.of("Engenharia de Software"),
                100
        );

        professor.debitCoins(40);

        assertThat(professor.getSaldoMoedas()).isEqualTo(60);
    }

    @Test
    void professorRejectsDebitWhenBalanceIsInsufficient() {
        Professor professor = new Professor(
                "Ana Souza",
                "12345678901",
                "ana@gmail.com",
                "senha123",
                UUID.randomUUID(),
                List.of("Engenharia de Software"),
                10
        );

        assertThatThrownBy(() -> professor.debitCoins(40))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("saldo suficiente");
    }

    @Test
    void studentCreditsAndDebitsCoins() {
        Student student = new Student(
                "Bruno Lima",
                "bruno@gmail.com",
                "11122233344",
                "123456789",
                "Rua A",
                "PUC Minas",
                "Engenharia de Software",
                "senha123"
        );

        student.creditCoins(80);
        student.debitCoins(30);

        assertThat(student.getSaldoMoedas()).isEqualTo(50);
    }

    @Test
    void studentRejectsDebitWhenBalanceIsInsufficient() {
        Student student = new Student(
                "Bruno Lima",
                "bruno@gmail.com",
                "11122233344",
                "123456789",
                "Rua A",
                "PUC Minas",
                "Engenharia de Software",
                "senha123"
        );

        assertThatThrownBy(() -> student.debitCoins(1))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("saldo suficiente");
    }
}

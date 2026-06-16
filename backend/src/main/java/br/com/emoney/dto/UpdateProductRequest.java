package br.com.emoney.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public class UpdateProductRequest {
    private String nome;
    private String descricao;
    private String fotoUrl;

    @Positive
    private Integer custoMoedas;

    @PositiveOrZero
    private Integer quantidade;

    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public String getFotoUrl() { return fotoUrl; }
    public Integer getCustoMoedas() { return custoMoedas; }
    public Integer getQuantidade() { return quantidade; }
}

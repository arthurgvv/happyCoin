package br.com.emoney.dto;

public class ProductRequest {
    private String nome;
    private String descricao;
    private String fotoUrl;
    private int custoMoedas;
    private Integer quantidade;

    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public String getFotoUrl() { return fotoUrl; }
    public int getCustoMoedas() { return custoMoedas; }
    public Integer getQuantidade() { return quantidade; }
}

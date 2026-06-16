package br.com.emoney.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.util.UUID;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "empresa_parceira")
    private String empresaParceira;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "custo_moedas")
    private int custoMoedas;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "company_id")
    private UUID companyId;

    /**
     * Quantidade disponível em estoque.
     * null = sem controle de estoque (ilimitado).
     * 0    = esgotado.
     * > 0  = disponível.
     */
    @Column(name = "quantidade")
    private Integer quantidade;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Version
    @Column(name = "version")
    private Long version;

    public Product() {
    }

    public Product(String nome, String empresaParceira, String descricao, int custoMoedas, String imageUrl) {
        this.id = UUID.randomUUID();
        this.nome = nome;
        this.empresaParceira = empresaParceira;
        this.descricao = descricao;
        this.custoMoedas = custoMoedas;
        this.imageUrl = imageUrl;
    }

    public Product(String nome, String empresaParceira, String descricao, int custoMoedas, String imageUrl, UUID companyId) {
        this(nome, empresaParceira, descricao, custoMoedas, imageUrl);
        this.companyId = companyId;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmpresaParceira() { return empresaParceira; }
    public void setEmpresaParceira(String empresaParceira) { this.empresaParceira = empresaParceira; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public int getCustoMoedas() { return custoMoedas; }
    public void setCustoMoedas(int custoMoedas) { this.custoMoedas = custoMoedas; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }

    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public boolean hasStock() { return quantidade == null || quantidade > 0; }
    public void reserveOne() {
        if (!hasStock()) {
            throw new IllegalStateException("Produto esgotado.");
        }
        if (quantidade != null) {
            quantidade -= 1;
        }
    }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public boolean isActive() { return ativo == null || ativo; }
}

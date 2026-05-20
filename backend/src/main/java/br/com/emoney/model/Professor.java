package br.com.emoney.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "professors")
public class Professor {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "cpf", unique = true)
    private String cpf;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "senha")
    private String senha;

    @Column(name = "institution_id")
    private UUID institutionId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "professor_cursos", joinColumns = @JoinColumn(name = "professor_id"))
    @Column(name = "curso")
    private List<String> cursos;

    @Column(name = "saldo_moedas")
    private int saldoMoedas;

    @Column(name = "ultimo_aviso")
    private String ultimoAviso;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    public Professor() {
        this.cursos = new ArrayList<>();
    }

    public Professor(String nome, String email, String senha, int saldoMoedas) {
        this(nome, null, email, senha, null, List.of(), saldoMoedas);
    }

    public Professor(String nome, String cpf, String email, String senha, UUID institutionId, List<String> cursos, int saldoMoedas) {
        this.id = UUID.randomUUID();
        this.nome = nome;
        this.cpf = cpf;
        this.email = email;
        this.senha = senha;
        this.institutionId = institutionId;
        this.cursos = new ArrayList<>(cursos);
        this.saldoMoedas = saldoMoedas;
        this.ultimoAviso = "";
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public UUID getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(UUID institutionId) {
        this.institutionId = institutionId;
    }

    public List<String> getCursos() {
        return cursos;
    }

    public void setCursos(List<String> cursos) {
        this.cursos = new ArrayList<>(cursos);
    }

    public int getSaldoMoedas() {
        return saldoMoedas;
    }

    public void setSaldoMoedas(int saldoMoedas) {
        this.saldoMoedas = saldoMoedas;
    }

    public String getUltimoAviso() {
        return ultimoAviso;
    }

    public void setUltimoAviso(String ultimoAviso) {
        this.ultimoAviso = ultimoAviso;
    }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}

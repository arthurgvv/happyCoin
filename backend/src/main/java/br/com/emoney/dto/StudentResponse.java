package br.com.emoney.dto;

import br.com.emoney.model.Student;

import java.time.LocalDateTime;
import java.util.UUID;

public class StudentResponse {
    private UUID id;
    private UUID institutionId;
    private String nome;
    private String email;
    private String cpf;
    private String rg;
    private String endereco;
    private String instituicao;
    private String curso;
    private int saldoMoedas;
    private String ultimoAviso;
    private LocalDateTime criadoEm;
    private String photoUrl;

    public StudentResponse(Student student) {
        this.id = student.getId();
        this.institutionId = student.getInstitutionId();
        this.nome = student.getNome();
        this.email = student.getEmail();
        this.cpf = student.getCpf();
        this.rg = student.getRg();
        this.endereco = student.getEndereco();
        this.instituicao = student.getInstituicao();
        this.curso = student.getCurso();
        this.saldoMoedas = student.getSaldoMoedas();
        this.ultimoAviso = student.getUltimoAviso();
        this.criadoEm = student.getCriadoEm();
        this.photoUrl = student.getPhotoUrl();
    }

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public UUID getInstitutionId() {
        return institutionId;
    }

    public String getEmail() {
        return email;
    }

    public String getCpf() {
        return cpf;
    }

    public String getRg() {
        return rg;
    }

    public String getEndereco() {
        return endereco;
    }

    public String getInstituicao() {
        return instituicao;
    }

    public String getCurso() {
        return curso;
    }

    public int getSaldoMoedas() {
        return saldoMoedas;
    }

    public String getUltimoAviso() {
        return ultimoAviso;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public String getPhotoUrl() { return photoUrl; }
}

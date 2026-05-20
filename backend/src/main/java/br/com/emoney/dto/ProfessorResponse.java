package br.com.emoney.dto;

import br.com.emoney.model.Professor;

import java.util.List;
import java.util.UUID;

public class ProfessorResponse {
    private UUID id;
    private String nome;
    private String cpf;
    private String email;
    private UUID institutionId;
    private String institutionName;
    private List<String> cursos;
    private int saldoMoedas;
    private String ultimoAviso;
    private String photoUrl;

    public ProfessorResponse(Professor professor) {
        this.id = professor.getId();
        this.nome = professor.getNome();
        this.cpf = professor.getCpf();
        this.email = professor.getEmail();
        this.institutionId = professor.getInstitutionId();
        this.cursos = professor.getCursos();
        this.saldoMoedas = professor.getSaldoMoedas();
        this.ultimoAviso = professor.getUltimoAviso();
        this.photoUrl = professor.getPhotoUrl();
    }

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getCpf() {
        return cpf;
    }

    public String getEmail() {
        return email;
    }

    public UUID getInstitutionId() {
        return institutionId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public List<String> getCursos() {
        return cursos;
    }

    public int getSaldoMoedas() {
        return saldoMoedas;
    }

    public String getUltimoAviso() {
        return ultimoAviso;
    }

    public String getPhotoUrl() { return photoUrl; }
}

package br.com.emoney.dto;

import br.com.emoney.model.Institution;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class InstitutionResponse {
    private UUID id;
    private String nome;
    private String email;
    private String telefone;
    private String endereco;
    private String identificadorInstitucional;
    private LocalDateTime criadoEm;
    private List<ProfessorResponse> professores;
    private String photoUrl;

    public InstitutionResponse(Institution institution, List<ProfessorResponse> professores) {
        this.id = institution.getId();
        this.nome = institution.getNome();
        this.email = institution.getEmail();
        this.telefone = institution.getTelefone();
        this.endereco = institution.getEndereco();
        this.identificadorInstitucional = institution.getIdentificadorInstitucional();
        this.criadoEm = institution.getCriadoEm();
        this.professores = professores;
        this.photoUrl = institution.getPhotoUrl();
    }

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getEndereco() {
        return endereco;
    }

    public String getIdentificadorInstitucional() {
        return identificadorInstitucional;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public List<ProfessorResponse> getProfessores() {
        return professores;
    }

    public String getPhotoUrl() { return photoUrl; }
}

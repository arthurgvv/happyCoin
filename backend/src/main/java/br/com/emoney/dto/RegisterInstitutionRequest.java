package br.com.emoney.dto;

import br.com.emoney.validation.ValidCnpj;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public class RegisterInstitutionRequest {
    @NotBlank
    private String nome;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6)
    private String senha;

    @NotBlank
    private String telefone;

    @NotBlank
    private String endereco;

    @NotBlank
    @ValidCnpj
    private String identificadorInstitucional;

    @Valid
    private List<RegisterProfessorRequest> professores = new ArrayList<>();

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
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

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getIdentificadorInstitucional() {
        return identificadorInstitucional;
    }

    public void setIdentificadorInstitucional(String identificadorInstitucional) {
        this.identificadorInstitucional = identificadorInstitucional;
    }

    public List<RegisterProfessorRequest> getProfessores() {
        return professores;
    }

    public void setProfessores(List<RegisterProfessorRequest> professores) {
        this.professores = professores;
    }
}

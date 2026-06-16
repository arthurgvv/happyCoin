package br.com.emoney.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UpdateInstitutionRequest {
    private String nome;

    @Email
    private String email;

    @Size(min = 6)
    private String senha;

    private String telefone;
    private String endereco;

    private String photoUrl;

    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getSenha() { return senha; }
    public String getTelefone() { return telefone; }
    public String getEndereco() { return endereco; }
    public String getPhotoUrl() { return photoUrl; }
}

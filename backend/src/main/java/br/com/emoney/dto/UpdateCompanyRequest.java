package br.com.emoney.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UpdateCompanyRequest {
    private String nomeFantasia;

    @Email
    private String email;

    @Size(min = 6)
    private String senha;

    private String photoUrl;

    public String getNomeFantasia() { return nomeFantasia; }
    public String getEmail() { return email; }
    public String getSenha() { return senha; }
    public String getPhotoUrl() { return photoUrl; }
}

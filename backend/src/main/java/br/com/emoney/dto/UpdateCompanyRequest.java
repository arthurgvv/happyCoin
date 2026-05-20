package br.com.emoney.dto;

public class UpdateCompanyRequest {
    private String nomeFantasia;
    private String email;
    private String senha;

    private String photoUrl;

    public String getNomeFantasia() { return nomeFantasia; }
    public String getEmail() { return email; }
    public String getSenha() { return senha; }
    public String getPhotoUrl() { return photoUrl; }
}

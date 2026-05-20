package br.com.emoney.dto;

public class UpdateInstitutionRequest {
    private String nome;
    private String email;
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

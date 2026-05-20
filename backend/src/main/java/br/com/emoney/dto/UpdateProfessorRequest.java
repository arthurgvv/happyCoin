package br.com.emoney.dto;

import java.util.List;

public class UpdateProfessorRequest {
    private String nome;
    private String email;
    private String senha;
    private List<String> cursos;
    private String photoUrl;

    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getSenha() { return senha; }
    public List<String> getCursos() { return cursos; }
    public String getPhotoUrl() { return photoUrl; }
}

package br.com.emoney.dto;

public class UpdateStudentRequest {
    private String nome;
    private String email;
    private String cpf;
    private String rg;
    private String endereco;
    private String instituicao;
    private String curso;
    private String senha;

    public String getNome() {
        return nome;
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

    public String getSenha() {
        return senha;
    }

    private String photoUrl;
    public String getPhotoUrl() { return photoUrl; }
}

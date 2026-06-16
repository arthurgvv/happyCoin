package br.com.emoney.dto;

import br.com.emoney.validation.ValidCpf;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UpdateStudentRequest {
    private String nome;

    @Email
    private String email;

    @ValidCpf
    private String cpf;

    private String rg;
    private String endereco;
    private String instituicao;
    private String curso;

    @Size(min = 6)
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

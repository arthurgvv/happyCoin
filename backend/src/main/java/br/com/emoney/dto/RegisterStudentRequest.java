package br.com.emoney.dto;

import br.com.emoney.validation.ValidCpf;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterStudentRequest {
    @NotBlank
    private String nome;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @ValidCpf
    private String cpf;

    @NotBlank
    private String rg;

    @NotBlank
    private String endereco;

    @NotBlank
    private String instituicao;

    @NotBlank
    private String curso;

    @NotBlank
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
}

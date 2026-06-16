package br.com.emoney.service;

import br.com.emoney.validation.BrazilianDocumentValidator;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class ValidationService {
    private static final List<String> INSTITUICOES_LEGADAS = List.of(
            "PUC Minas",
            "PUC Campinas",
            "PUC Rio",
            "PUC SP",
            "PUC Parana",
            "PUC Goias",
            "PUC Rio Grande do Sul"
    );
    private static final List<String> CURSOS = List.of(
            "Administracao",
            "Arquitetura e Urbanismo",
            "Ciencia da Computacao",
            "Direito",
            "Engenharia Civil",
            "Engenharia de Software",
            "Medicina",
            "Psicologia",
            "Publicidade e Propaganda",
            "Sistemas de Informacao"
    );

    public List<String> cursos() {
        return CURSOS;
    }

    public List<String> instituicoes() {
        return INSTITUICOES_LEGADAS;
    }

    public String cpf(String value) {
        String digits = BrazilianDocumentValidator.onlyDigits(value);
        if (digits.length() != 11) {
            throw new ResponseStatusException(BAD_REQUEST, "CPF deve possuir exatamente 11 digitos.");
        }
        if (!BrazilianDocumentValidator.isValidCpf(digits)) {
            throw new ResponseStatusException(BAD_REQUEST, "CPF invalido.");
        }
        return digits;
    }

    public String rg(String value) {
        String digits = BrazilianDocumentValidator.onlyDigits(value);
        if (digits.length() != 9) {
            throw new ResponseStatusException(BAD_REQUEST, "RG deve possuir exatamente 9 digitos.");
        }
        return digits;
    }

    public String cnpj(String value) {
        String digits = BrazilianDocumentValidator.onlyDigits(value);
        if (digits.length() != 14) {
            throw new ResponseStatusException(BAD_REQUEST, "CNPJ deve possuir exatamente 14 digitos.");
        }
        if (!BrazilianDocumentValidator.isValidCnpj(digits)) {
            throw new ResponseStatusException(BAD_REQUEST, "CNPJ invalido.");
        }
        return digits;
    }

    public String senha(String value) {
        String password = text(value, "Senha");
        if (!password.matches("(?=.*[A-Za-z])(?=.*\\d).{6,}")) {
            throw new ResponseStatusException(BAD_REQUEST, "Senha deve ter pelo menos 6 caracteres, com letras e numeros.");
        }
        return password;
    }

    public String curso(String value) {
        String curso = text(value, "Curso");
        if (!CURSOS.contains(curso)) {
            throw new ResponseStatusException(BAD_REQUEST, "Curso nao cadastrado.");
        }
        return curso;
    }

    public List<String> cursos(List<String> values) {
        if (values == null || values.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Professor deve possuir pelo menos um curso.");
        }
        return values.stream().map(this::curso).distinct().toList();
    }

    public String instituicao(String value) {
        return text(value, "Instituicao de ensino");
    }

    public String text(String value, String fieldName) {
        String text = value == null ? "" : value.trim();
        if (text.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, fieldName + " e obrigatorio.");
        }
        return text;
    }

}

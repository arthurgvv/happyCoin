package br.com.emoney.service;

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
        String digits = onlyDigits(value);
        if (digits.length() != 11) {
            throw new ResponseStatusException(BAD_REQUEST, "CPF deve possuir exatamente 11 digitos.");
        }
        if (!isValidCpf(digits)) {
            throw new ResponseStatusException(BAD_REQUEST, "CPF invalido.");
        }
        return digits;
    }

    public String rg(String value) {
        String digits = onlyDigits(value);
        if (digits.length() != 9) {
            throw new ResponseStatusException(BAD_REQUEST, "RG deve possuir exatamente 9 digitos.");
        }
        return digits;
    }

    public String cnpj(String value) {
        String digits = onlyDigits(value);
        if (digits.length() != 14) {
            throw new ResponseStatusException(BAD_REQUEST, "CNPJ deve possuir exatamente 14 digitos.");
        }
        if (!isValidCnpj(digits)) {
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

    private boolean isValidCpf(String digits) {
        // Rejeita sequências com todos os dígitos iguais (ex: 111.111.111-11)
        if (digits.chars().distinct().count() == 1) return false;

        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += Character.getNumericValue(digits.charAt(i)) * (10 - i);
        }
        int first = (sum * 10) % 11;
        if (first == 10) first = 0;
        if (first != Character.getNumericValue(digits.charAt(9))) return false;

        sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += Character.getNumericValue(digits.charAt(i)) * (11 - i);
        }
        int second = (sum * 10) % 11;
        if (second == 10) second = 0;
        return second == Character.getNumericValue(digits.charAt(10));
    }

    private boolean isValidCnpj(String digits) {
        // Rejeita sequências com todos os dígitos iguais
        if (digits.chars().distinct().count() == 1) return false;

        int[] weights1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] weights2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

        int sum = 0;
        for (int i = 0; i < 12; i++) {
            sum += Character.getNumericValue(digits.charAt(i)) * weights1[i];
        }
        int first = sum % 11;
        first = first < 2 ? 0 : 11 - first;
        if (first != Character.getNumericValue(digits.charAt(12))) return false;

        sum = 0;
        for (int i = 0; i < 13; i++) {
            sum += Character.getNumericValue(digits.charAt(i)) * weights2[i];
        }
        int second = sum % 11;
        second = second < 2 ? 0 : 11 - second;
        return second == Character.getNumericValue(digits.charAt(13));
    }

    private String onlyDigits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }
}

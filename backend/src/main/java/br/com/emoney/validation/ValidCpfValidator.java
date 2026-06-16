package br.com.emoney.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidCpfValidator implements ConstraintValidator<ValidCpf, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value == null || value.isBlank() || BrazilianDocumentValidator.isValidCpf(value);
    }
}

package br.com.emoney.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidCnpjValidator implements ConstraintValidator<ValidCnpj, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value == null || value.isBlank() || BrazilianDocumentValidator.isValidCnpj(value);
    }
}

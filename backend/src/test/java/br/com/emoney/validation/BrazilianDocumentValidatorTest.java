package br.com.emoney.validation;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BrazilianDocumentValidatorTest {

    @Test
    void validatesCpfWithOrWithoutFormatting() {
        assertThat(BrazilianDocumentValidator.isValidCpf("52998224725")).isTrue();
        assertThat(BrazilianDocumentValidator.isValidCpf("529.982.247-25")).isTrue();
    }

    @Test
    void rejectsInvalidCpf() {
        assertThat(BrazilianDocumentValidator.isValidCpf("11111111111")).isFalse();
        assertThat(BrazilianDocumentValidator.isValidCpf("52998224724")).isFalse();
    }

    @Test
    void validatesCnpjWithOrWithoutFormatting() {
        assertThat(BrazilianDocumentValidator.isValidCnpj("11222333000181")).isTrue();
        assertThat(BrazilianDocumentValidator.isValidCnpj("11.222.333/0001-81")).isTrue();
    }

    @Test
    void rejectsInvalidCnpj() {
        assertThat(BrazilianDocumentValidator.isValidCnpj("11111111111111")).isFalse();
        assertThat(BrazilianDocumentValidator.isValidCnpj("11222333000180")).isFalse();
    }
}

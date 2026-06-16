package br.com.emoney.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProductStockTest {

    @Test
    void reservesOneUnitWhenStockIsLimited() {
        Product product = new Product("Curso", "Empresa", "Descricao", 100, "/image.svg");
        product.setQuantidade(2);

        product.reserveOne();

        assertThat(product.getQuantidade()).isEqualTo(1);
    }

    @Test
    void unlimitedStockCanBeReservedWithoutChangingQuantity() {
        Product product = new Product("Curso", "Empresa", "Descricao", 100, "/image.svg");

        product.reserveOne();

        assertThat(product.getQuantidade()).isNull();
    }

    @Test
    void rejectsReservationWhenProductIsOutOfStock() {
        Product product = new Product("Curso", "Empresa", "Descricao", 100, "/image.svg");
        product.setQuantidade(0);

        assertThat(product.hasStock()).isFalse();
        assertThatThrownBy(product::reserveOne)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("esgotado");
    }
}

package br.com.emoney.service;

import br.com.emoney.messaging.PurchaseCompletedEvent;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Message;
import br.com.emoney.model.Product;
import br.com.emoney.model.ProductPurchase;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.MessageRepository;
import br.com.emoney.repository.ProductPurchaseRepository;
import br.com.emoney.repository.ProductRepository;
import br.com.emoney.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PurchaseServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductPurchaseRepository purchaseRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Test
    void purchasesProductAndPublishesInternalEvent() {
        PurchaseService service = service();
        UUID companyId = UUID.randomUUID();
        Product product = new Product("Curso", "Empresa", "Descricao", 100, "/curso.svg", companyId);
        product.setQuantidade(2);
        Student student = student();
        student.creditCoins(150);
        ProductPurchase purchase = new ProductPurchase(product.getId(), companyId, student.getId(), "Curso", student.getNome(), student.getEmail(), 100);

        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(studentRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(studentRepository.save(student)).thenReturn(student);
        when(purchaseRepository.save(any(ProductPurchase.class))).thenReturn(purchase);

        service.purchase(new AuthSession("token", student.getId(), UserRole.STUDENT), product.getId());

        assertThat(student.getSaldoMoedas()).isEqualTo(50);
        assertThat(product.getQuantidade()).isEqualTo(1);
        verify(studentRepository).save(student);
        verify(productRepository).save(product);
        verify(purchaseRepository).save(any(ProductPurchase.class));
        verify(messageRepository, times(2)).save(any(Message.class));
        verify(eventPublisher).publishEvent(any(PurchaseCompletedEvent.class));
    }

    @Test
    void rejectsPurchaseWhenStudentBalanceIsInsufficient() {
        PurchaseService service = service();
        Product product = new Product("Curso", "Empresa", "Descricao", 100, "/curso.svg", UUID.randomUUID());
        Student student = student();
        student.creditCoins(50);

        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(studentRepository.findById(student.getId())).thenReturn(Optional.of(student));

        assertThatThrownBy(() -> service.purchase(new AuthSession("token", student.getId(), UserRole.STUDENT), product.getId()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Saldo insuficiente");
        verify(purchaseRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void rejectsPurchaseWhenProductIsOutOfStock() {
        PurchaseService service = service();
        Product product = new Product("Curso", "Empresa", "Descricao", 100, "/curso.svg", UUID.randomUUID());
        product.setQuantidade(0);

        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> service.purchase(new AuthSession("token", UUID.randomUUID(), UserRole.STUDENT), product.getId()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Produto esgotado");
        verify(studentRepository, never()).findById(any());
        verify(purchaseRepository, never()).save(any());
    }

    private PurchaseService service() {
        return new PurchaseService(productRepository, purchaseRepository, studentRepository, messageRepository, eventPublisher, new AuthorizationService());
    }

    private Student student() {
        Student student = new Student("Bruno", "bruno@gmail.com", "11122233344", "123456789", "Rua A", "PUC", "Engenharia", "senha");
        student.setInstitutionId(UUID.randomUUID());
        return student;
    }
}

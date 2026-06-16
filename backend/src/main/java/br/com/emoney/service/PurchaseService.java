package br.com.emoney.service;

import br.com.emoney.dto.StudentResponse;
import br.com.emoney.messaging.PurchaseCompletedEvent;
import br.com.emoney.messaging.PurchaseNotification;
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
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class PurchaseService {
    private final ProductRepository productRepository;
    private final ProductPurchaseRepository purchaseRepository;
    private final StudentRepository studentRepository;
    private final MessageRepository messageRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final AuthorizationService authorizationService;

    public PurchaseService(ProductRepository productRepository, ProductPurchaseRepository purchaseRepository,
                           StudentRepository studentRepository, MessageRepository messageRepository,
                           ApplicationEventPublisher eventPublisher, AuthorizationService authorizationService) {
        this.productRepository = productRepository;
        this.purchaseRepository = purchaseRepository;
        this.studentRepository = studentRepository;
        this.messageRepository = messageRepository;
        this.eventPublisher = eventPublisher;
        this.authorizationService = authorizationService;
    }

    @Transactional
    public StudentResponse purchase(AuthSession session, UUID productId) {
        authorizationService.requireRole(session, UserRole.STUDENT, "Apenas alunos podem comprar produtos.");

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Produto nao encontrado."));

        if (!product.isActive()) {
            throw new ResponseStatusException(NOT_FOUND, "Produto nao encontrado.");
        }

        if (!product.hasStock()) {
            throw new ResponseStatusException(BAD_REQUEST, "Produto esgotado.");
        }

        Student student = studentRepository.findById(session.getUserId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Aluno nao encontrado."));

        if (student.getSaldoMoedas() < product.getCustoMoedas()) {
            throw new ResponseStatusException(BAD_REQUEST, "Saldo insuficiente para comprar este produto.");
        }

        student.debitCoins(product.getCustoMoedas());
        Student saved = studentRepository.save(student);

        if (product.getQuantidade() != null) {
            product.reserveOne();
            productRepository.save(product);
        }

        ProductPurchase purchase = purchaseRepository.save(new ProductPurchase(
                product.getId(),
                product.getCompanyId(),
                student.getId(),
                product.getNome(),
                student.getNome(),
                student.getEmail(),
                product.getCustoMoedas()
        ));

        String couponCode = couponCode(purchase.getId());
        String companyName = product.getEmpresaParceira() == null || product.getEmpresaParceira().isBlank()
                ? "Empresa parceira"
                : product.getEmpresaParceira();
        messageRepository.save(new Message(
                product.getCompanyId() != null ? product.getCompanyId() : product.getId(),
                UserRole.COMPANY,
                companyName,
                student.getId(),
                UserRole.STUDENT,
                student.getNome(),
                "Cupom disponivel: " + product.getNome(),
                "Seu resgate foi confirmado.\n\nProduto: " + product.getNome()
                        + "\nEmpresa: " + companyName
                        + "\nCodigo do cupom: " + couponCode
                        + "\nMoedas utilizadas: " + product.getCustoMoedas()
                        + "\n\nUse o botao Ver QR ou apresente este codigo para a empresa parceira.",
                null
        ).withType("PURCHASE_COUPON").withPurchaseId(purchase.getId()));

        if (product.getCompanyId() != null) {
            messageRepository.save(new Message(
                    product.getId(),
                    UserRole.INSTITUTION,
                    "HappyCoin",
                    product.getCompanyId(),
                    UserRole.COMPANY,
                    companyName,
                    "Novo resgate: " + product.getNome(),
                    "Um aluno resgatou uma vantagem da sua empresa.\n\nAluno: " + student.getNome()
                            + "\nEmail do aluno: " + student.getEmail()
                            + "\nProduto: " + product.getNome()
                            + "\nCodigo do cupom: " + couponCode
                            + "\nMoedas utilizadas: " + product.getCustoMoedas(),
                    null
            ).withType("PURCHASE_NOTIFICATION").withPurchaseId(purchase.getId()));
        }

        eventPublisher.publishEvent(new PurchaseCompletedEvent(new PurchaseNotification(
                purchase.getId(),
                student.getId(),
                student.getNome(),
                student.getEmail(),
                product.getNome(),
                product.getCustoMoedas()
        )));

        return new StudentResponse(saved);
    }

    private String couponCode(UUID purchaseId) {
        return purchaseId.toString().toUpperCase().replace("-", "");
    }
}

package br.com.emoney.service;

import br.com.emoney.dto.ProductPurchaseResponse;
import br.com.emoney.dto.ProductRequest;
import br.com.emoney.dto.UpdateProductRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Company;
import br.com.emoney.model.Product;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.ProductPurchaseRepository;
import br.com.emoney.repository.ProductRepository;
import br.com.emoney.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductPurchaseRepository purchaseRepository;
    private final StudentRepository studentRepository;
    private final CompanyService companyService;
    private final ValidationService validationService;
    private final AuthorizationService authorizationService;

    public ProductService(ProductRepository productRepository, ProductPurchaseRepository purchaseRepository, StudentRepository studentRepository, CompanyService companyService, ValidationService validationService, AuthorizationService authorizationService) {
        this.productRepository = productRepository;
        this.purchaseRepository = purchaseRepository;
        this.studentRepository = studentRepository;
        this.companyService = companyService;
        this.validationService = validationService;
        this.authorizationService = authorizationService;
    }

    public List<Product> list() {
        return productRepository.findAll().stream()
                .filter(Product::isActive)
                .toList();
    }

    public List<Product> listByCompany(UUID companyId) {
        return productRepository.findByCompanyId(companyId).stream()
                .filter(Product::isActive)
                .toList();
    }

    public Product create(AuthSession session, ProductRequest request) {
        authorizationService.requireRole(session, UserRole.COMPANY, "Apenas empresas parceiras podem cadastrar produtos.");

        if (request.getCustoMoedas() == null || request.getCustoMoedas() <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Custo em moedas deve ser maior que zero.");
        }

        Company company = companyService.findEntityById(session.getUserId());
        String imageUrl = request.getFotoUrl() == null || request.getFotoUrl().isBlank()
                ? "/assets/products/company-offer.svg"
                : validationService.text(request.getFotoUrl(), "Foto do produto");

        Product product = new Product(
                validationService.text(request.getNome(), "Nome do produto"),
                company.getNomeFantasia(),
                validationService.text(request.getDescricao(), "Descricao"),
                request.getCustoMoedas(),
                imageUrl,
                company.getId()
        );

        if (request.getQuantidade() != null) {
            if (request.getQuantidade() < 0) {
                throw new ResponseStatusException(BAD_REQUEST, "Quantidade nao pode ser negativa.");
            }
            product.setQuantidade(request.getQuantidade());
        }

        return productRepository.save(product);
    }

    public void remove(AuthSession session, UUID productId) {
        authorizationService.requireRole(session, UserRole.COMPANY, "Apenas empresas parceiras podem remover produtos.");

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Produto nao encontrado."));

        if (product.getCompanyId() == null || !product.getCompanyId().equals(session.getUserId())) {
            throw new ResponseStatusException(FORBIDDEN, "A empresa so pode remover produtos cadastrados por ela.");
        }

        product.setAtivo(false);
        productRepository.save(product);
    }

    public Product update(AuthSession session, UUID productId, UpdateProductRequest request) {
        authorizationService.requireRole(session, UserRole.COMPANY, "Apenas empresas parceiras podem editar produtos.");

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Produto nao encontrado."));

        if (!product.isActive()) {
            throw new ResponseStatusException(NOT_FOUND, "Produto nao encontrado.");
        }

        if (product.getCompanyId() == null || !product.getCompanyId().equals(session.getUserId())) {
            throw new ResponseStatusException(FORBIDDEN, "A empresa so pode editar produtos cadastrados por ela.");
        }

        if (request.getNome() != null && !request.getNome().isBlank()) {
            product.setNome(validationService.text(request.getNome(), "Nome do produto"));
        }
        if (request.getDescricao() != null && !request.getDescricao().isBlank()) {
            product.setDescricao(validationService.text(request.getDescricao(), "Descricao"));
        }
        if (request.getCustoMoedas() != null && request.getCustoMoedas() > 0) {
            product.setCustoMoedas(request.getCustoMoedas());
        }
        if (request.getFotoUrl() != null && !request.getFotoUrl().isBlank()) {
            product.setImageUrl(request.getFotoUrl());
        }
        if (request.getQuantidade() != null && request.getQuantidade() < 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Quantidade nao pode ser negativa.");
        }
        product.setQuantidade(request.getQuantidade()); // null = ilimitado

        return productRepository.save(product);
    }

    public List<ProductPurchaseResponse> purchasesByCompany(UUID companyId) {
        return purchaseRepository.findByCompanyIdOrderByCriadoEmDesc(companyId)
                .stream()
                .map(purchase -> {
                    ProductPurchaseResponse response = new ProductPurchaseResponse(purchase);
                    studentRepository.findById(purchase.getStudentId()).ifPresent(student ->
                            response.withStudentInfo(student.getNome(), student.getEmail(), student.getPhotoUrl()));
                    return response;
                })
                .toList();
    }
}

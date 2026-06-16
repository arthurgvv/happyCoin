package br.com.emoney.controller;

import br.com.emoney.dto.ProductPurchaseResponse;
import br.com.emoney.dto.ProductRequest;
import br.com.emoney.dto.StudentResponse;
import br.com.emoney.dto.UpdateProductRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Product;
import br.com.emoney.model.UserRole;
import br.com.emoney.service.AuthService;
import br.com.emoney.service.AuthorizationService;
import br.com.emoney.service.ProductService;
import br.com.emoney.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    private final PurchaseService purchaseService;
    private final AuthService authService;
    private final AuthorizationService authorizationService;

    public ProductController(ProductService productService, PurchaseService purchaseService, AuthService authService,
                             AuthorizationService authorizationService) {
        this.productService = productService;
        this.purchaseService = purchaseService;
        this.authService = authService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public List<Product> list() {
        return productService.list();
    }

    @GetMapping("/mine")
    public List<Product> mine(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireCompany(session);
        return productService.listByCompany(session.getUserId());
    }

    @PostMapping
    public Product create(@RequestHeader("Authorization") String authorization, @Valid @RequestBody ProductRequest request) {
        AuthSession session = authService.requireSession(authorization);
        return productService.create(session, request);
    }

    @DeleteMapping("/{id}")
    public void remove(@RequestHeader("Authorization") String authorization, @PathVariable UUID id) {
        AuthSession session = authService.requireSession(authorization);
        productService.remove(session, id);
    }

    @PostMapping("/{id}/purchase")
    public StudentResponse purchase(@RequestHeader("Authorization") String authorization, @PathVariable UUID id) {
        AuthSession session = authService.requireSession(authorization);
        return purchaseService.purchase(session, id);
    }

    @PutMapping("/{id}")
    public Product update(@RequestHeader("Authorization") String authorization, @PathVariable UUID id, @Valid @RequestBody UpdateProductRequest request) {
        AuthSession session = authService.requireSession(authorization);
        return productService.update(session, id, request);
    }

    @GetMapping("/purchases")
    public List<ProductPurchaseResponse> purchases(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireRole(session, UserRole.COMPANY, "Apenas empresas podem visualizar resgates.");
        return productService.purchasesByCompany(session.getUserId());
    }
}

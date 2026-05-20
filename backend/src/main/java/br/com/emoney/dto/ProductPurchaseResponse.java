package br.com.emoney.dto;

import br.com.emoney.model.ProductPurchase;

import java.time.LocalDateTime;
import java.util.UUID;

public class ProductPurchaseResponse {
    private UUID id;
    private UUID productId;
    private UUID companyId;
    private UUID studentId;
    private String productName;
    private String companyName;
    private String companyPhotoUrl;
    private String productImageUrl;
    private String studentName;
    private String studentEmail;
    private String studentPhotoUrl;
    private int custoMoedas;
    private LocalDateTime criadoEm;

    public ProductPurchaseResponse(ProductPurchase purchase) {
        this.id = purchase.getId();
        this.productId = purchase.getProductId();
        this.companyId = purchase.getCompanyId();
        this.studentId = purchase.getStudentId();
        this.productName = purchase.getProductName();
        this.studentName = purchase.getStudentName();
        this.studentEmail = purchase.getStudentEmail();
        this.custoMoedas = purchase.getCustoMoedas();
        this.criadoEm = purchase.getCriadoEm();
    }

    public ProductPurchaseResponse withCompanyInfo(String name, String photoUrl) {
        this.companyName = name;
        this.companyPhotoUrl = photoUrl;
        return this;
    }

    public ProductPurchaseResponse withProductImage(String imageUrl) {
        this.productImageUrl = imageUrl;
        return this;
    }

    public ProductPurchaseResponse withStudentInfo(String name, String email, String photoUrl) {
        this.studentName = name;
        this.studentEmail = email;
        this.studentPhotoUrl = photoUrl;
        return this;
    }

    public UUID getId() { return id; }
    public UUID getProductId() { return productId; }
    public UUID getCompanyId() { return companyId; }
    public UUID getStudentId() { return studentId; }
    public String getProductName() { return productName; }
    public String getCompanyName() { return companyName; }
    public String getCompanyPhotoUrl() { return companyPhotoUrl; }
    public String getProductImageUrl() { return productImageUrl; }
    public String getStudentName() { return studentName; }
    public String getStudentEmail() { return studentEmail; }
    public String getStudentPhotoUrl() { return studentPhotoUrl; }
    public int getCustoMoedas() { return custoMoedas; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}

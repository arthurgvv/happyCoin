package br.com.emoney.messaging;

import java.io.Serializable;
import java.util.UUID;

public class PurchaseNotification implements Serializable {

    private UUID purchaseId;
    private UUID studentId;
    private String studentName;
    private String studentEmail;
    private String productName;
    private int custoMoedas;

    public PurchaseNotification() {}

    public PurchaseNotification(UUID purchaseId, UUID studentId, String studentName,
                                 String studentEmail, String productName, int custoMoedas) {
        this.purchaseId = purchaseId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.productName = productName;
        this.custoMoedas = custoMoedas;
    }

    public UUID getPurchaseId()    { return purchaseId; }
    public UUID getStudentId()     { return studentId; }
    public String getStudentName() { return studentName; }
    public String getStudentEmail(){ return studentEmail; }
    public String getProductName() { return productName; }
    public int getCustoMoedas()    { return custoMoedas; }
}

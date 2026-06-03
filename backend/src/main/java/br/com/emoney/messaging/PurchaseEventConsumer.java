package br.com.emoney.messaging;

import br.com.emoney.config.RabbitMQConfig;
import br.com.emoney.repository.CompanyRepository;
import br.com.emoney.repository.ProductPurchaseRepository;
import br.com.emoney.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class PurchaseEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(PurchaseEventConsumer.class);

    private final ProductPurchaseRepository purchaseRepository;
    private final CompanyRepository companyRepository;
    private final EmailService emailService;

    public PurchaseEventConsumer(ProductPurchaseRepository purchaseRepository,
                                  CompanyRepository companyRepository,
                                  EmailService emailService) {
        this.purchaseRepository = purchaseRepository;
        this.companyRepository = companyRepository;
        this.emailService = emailService;
    }

    @RabbitListener(queues = RabbitMQConfig.PURCHASE_QUEUE)
    public void onPurchase(PurchaseNotification notification) {
        log.info("[RabbitMQ] Processando compra: id={} produto='{}' aluno='{}' email={} moedas={}",
                notification.getPurchaseId(),
                notification.getProductName(),
                notification.getStudentName(),
                notification.getStudentEmail(),
                notification.getCustoMoedas());

        purchaseRepository.findById(notification.getPurchaseId()).ifPresent(purchase -> {
            emailService.sendCouponEmailToStudent(
                    notification.getStudentEmail(),
                    notification.getStudentName(),
                    notification.getProductName(),
                    notification.getPurchaseId(),
                    notification.getCustoMoedas(),
                    purchase.getCriadoEm()
            );

            if (purchase.getCompanyId() != null) {
                companyRepository.findById(purchase.getCompanyId()).ifPresent(company ->
                        emailService.sendPurchaseNotificationToCompany(
                                company.getEmail(),
                                company.getNomeFantasia(),
                                notification.getStudentName(),
                                notification.getProductName(),
                                notification.getPurchaseId(),
                                notification.getCustoMoedas(),
                                purchase.getCriadoEm()
                        )
                );
            }
        });
    }
}

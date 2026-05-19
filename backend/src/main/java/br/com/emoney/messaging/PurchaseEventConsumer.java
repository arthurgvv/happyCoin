package br.com.emoney.messaging;

import br.com.emoney.config.RabbitMQConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class PurchaseEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(PurchaseEventConsumer.class);

    @RabbitListener(queues = RabbitMQConfig.PURCHASE_QUEUE)
    public void onPurchase(PurchaseNotification notification) {
        log.info("[RabbitMQ] Processando compra: id={} produto='{}' aluno='{}' email={} moedas={}",
                notification.getPurchaseId(),
                notification.getProductName(),
                notification.getStudentName(),
                notification.getStudentEmail(),
                notification.getCustoMoedas());

        // ponto de extensão: envio de email, webhook, etc.
    }
}

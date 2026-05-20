package br.com.emoney.messaging;

import br.com.emoney.config.RabbitMQConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class PurchaseEventProducer {

    private static final Logger log = LoggerFactory.getLogger(PurchaseEventProducer.class);

    private final RabbitTemplate rabbitTemplate;

    public PurchaseEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(PurchaseNotification notification) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.PURCHASE_EXCHANGE,
                    RabbitMQConfig.PURCHASE_ROUTING,
                    notification
            );
            log.info("[RabbitMQ] Evento de compra publicado: produto={} aluno={}",
                    notification.getProductName(), notification.getStudentEmail());
        } catch (AmqpException ex) {
            log.warn("[RabbitMQ] Broker indisponivel. Evento nao publicado: produto={} aluno={} motivo={}",
                    notification.getProductName(), notification.getStudentEmail(), ex.getMessage());
        }
    }
}

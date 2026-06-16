package br.com.emoney.messaging;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class PurchaseNotificationListener {
    private final PurchaseEventProducer purchaseEventProducer;

    public PurchaseNotificationListener(PurchaseEventProducer purchaseEventProducer) {
        this.purchaseEventProducer = purchaseEventProducer;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(PurchaseCompletedEvent event) {
        purchaseEventProducer.publish(event.notification());
    }
}

package br.com.emoney.messaging;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.lang.reflect.Method;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PurchaseNotificationListenerTest {

    @Mock
    private PurchaseEventProducer purchaseEventProducer;

    @Test
    void publishesPurchaseNotificationAfterTransactionCommit() throws Exception {
        PurchaseNotificationListener listener = new PurchaseNotificationListener(purchaseEventProducer);
        PurchaseNotification notification = new PurchaseNotification(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "Bruno Lima",
                "bruno@gmail.com",
                "Curso de Python",
                100
        );

        listener.on(new PurchaseCompletedEvent(notification));

        verify(purchaseEventProducer).publish(notification);

        Method method = PurchaseNotificationListener.class.getDeclaredMethod("on", PurchaseCompletedEvent.class);
        TransactionalEventListener annotation = method.getAnnotation(TransactionalEventListener.class);
        assertThat(annotation.phase()).isEqualTo(TransactionPhase.AFTER_COMMIT);
    }
}

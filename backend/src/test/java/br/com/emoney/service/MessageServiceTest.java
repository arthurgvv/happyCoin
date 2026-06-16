package br.com.emoney.service;

import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Message;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.MessageRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Test
    void returnsInboxMessagesForSessionUser() {
        MessageService service = new MessageService(messageRepository);
        UUID userId = UUID.randomUUID();
        Message message = message(UUID.randomUUID(), UserRole.PROFESSOR, userId, UserRole.STUDENT, "Ola");
        when(messageRepository.findByToIdOrderByCriadoEmDesc(userId)).thenReturn(List.of(message));

        AuthSession session = new AuthSession("token", userId, UserRole.STUDENT);

        assertThat(service.inbox(session)).hasSize(1);
    }

    @Test
    void filtersAutomaticPurchaseMessagesFromStudentSentMessages() {
        MessageService service = new MessageService(messageRepository);
        UUID userId = UUID.randomUUID();
        Message direct = message(userId, UserRole.STUDENT, UUID.randomUUID(), UserRole.PROFESSOR, "Duvida");
        Message purchase = message(userId, UserRole.STUDENT, UUID.randomUUID(), UserRole.COMPANY, "Novo resgate: Curso")
                .withType("PURCHASE_NOTIFICATION");
        when(messageRepository.findByFromIdOrderByCriadoEmDesc(userId)).thenReturn(List.of(direct, purchase));

        AuthSession session = new AuthSession("token", userId, UserRole.STUDENT);

        assertThat(service.sent(session))
                .hasSize(1)
                .first()
                .extracting("subject")
                .isEqualTo("Duvida");
    }

    @Test
    void includesAutomaticCoinTransferMessagesInProfessorSentMessages() {
        MessageService service = new MessageService(messageRepository);
        UUID professorId = UUID.randomUUID();
        Message transfer = message(professorId, UserRole.PROFESSOR, UUID.randomUUID(), UserRole.STUDENT, "Voce recebeu 50 moedas")
                .withType("COIN_TRANSFER");
        when(messageRepository.findByFromIdOrderByCriadoEmDesc(professorId)).thenReturn(List.of(transfer));

        AuthSession session = new AuthSession("token", professorId, UserRole.PROFESSOR);

        assertThat(service.sent(session))
                .hasSize(1)
                .first()
                .extracting("type")
                .isEqualTo("COIN_TRANSFER");
    }

    @Test
    void rejectsMarkReadWhenSessionUserIsNotMessageRecipient() {
        MessageService service = new MessageService(messageRepository);
        UUID messageId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        Message message = message(UUID.randomUUID(), UserRole.PROFESSOR, ownerId, UserRole.STUDENT, "Ola");
        when(messageRepository.findById(messageId)).thenReturn(Optional.of(message));

        AuthSession session = new AuthSession("token", UUID.randomUUID(), UserRole.STUDENT);

        assertThatThrownBy(() -> service.markRead(session, messageId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Acesso negado");
        verify(messageRepository, never()).save(message);
    }

    @Test
    void marksMessageAsReadForRecipient() {
        MessageService service = new MessageService(messageRepository);
        UUID messageId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        Message message = message(UUID.randomUUID(), UserRole.PROFESSOR, ownerId, UserRole.STUDENT, "Ola");
        when(messageRepository.findById(messageId)).thenReturn(Optional.of(message));

        AuthSession session = new AuthSession("token", ownerId, UserRole.STUDENT);

        service.markRead(session, messageId);

        assertThat(message.isLido()).isTrue();
        verify(messageRepository).save(message);
    }

    private Message message(UUID fromId, UserRole fromRole, UUID toId, UserRole toRole, String subject) {
        return new Message(
                fromId, fromRole, fromRole.name(),
                toId, toRole, toRole.name(),
                subject, "Corpo", null
        );
    }
}

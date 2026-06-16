package br.com.emoney.service;

import br.com.emoney.dto.MessageResponse;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Message;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class MessageService {
    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public List<MessageResponse> inbox(AuthSession session) {
        return messageRepository.findByToIdOrderByCriadoEmDesc(session.getUserId())
                .stream()
                .map(MessageResponse::new)
                .toList();
    }

    public List<MessageResponse> sent(AuthSession session) {
        return messageRepository.findByFromIdOrderByCriadoEmDesc(session.getUserId())
                .stream()
                .filter(message -> shouldShowSentMessage(session.getRole(), message))
                .map(MessageResponse::new)
                .toList();
    }

    public void markRead(AuthSession session, UUID messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Mensagem nao encontrada."));
        if (!message.getToId().equals(session.getUserId())) {
            throw new ResponseStatusException(FORBIDDEN, "Acesso negado.");
        }
        message.setLido(true);
        messageRepository.save(message);
    }

    private boolean shouldShowSentMessage(UserRole role, Message message) {
        if (role == UserRole.STUDENT) {
            return (message.getType() == null || !message.getType().startsWith("PURCHASE_"))
                    && (message.getSubject() == null || !message.getSubject().startsWith("Novo resgate: "));
        }
        return true;
    }
}

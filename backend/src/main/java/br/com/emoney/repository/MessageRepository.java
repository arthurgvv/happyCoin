package br.com.emoney.repository;

import br.com.emoney.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByToIdOrderByCriadoEmDesc(UUID toId);
    List<Message> findByFromIdOrderByCriadoEmDesc(UUID fromId);
}

package br.com.emoney.repository;

import br.com.emoney.model.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface AuthSessionJpaRepository extends JpaRepository<AuthSession, String> {
    long deleteByExpiresAtBeforeOrRevokedAtBefore(LocalDateTime expiredBefore, LocalDateTime revokedBefore);
}

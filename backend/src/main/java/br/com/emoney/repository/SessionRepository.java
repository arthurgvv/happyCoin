package br.com.emoney.repository;

import br.com.emoney.model.AuthSession;
import br.com.emoney.model.UserRole;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public class SessionRepository {

    private final AuthSessionJpaRepository jpaRepository;

    public SessionRepository(AuthSessionJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    public AuthSession create(UUID userId, UserRole role) {
        String token = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        return jpaRepository.save(new AuthSession(token, userId, role, now, now.plusHours(8), null));
    }

    public Optional<AuthSession> findByToken(String token) {
        return jpaRepository.findById(token).filter(AuthSession::isActive);
    }

    public void revoke(String token) {
        jpaRepository.findById(token).ifPresent(session -> {
            session.revoke();
            jpaRepository.save(session);
        });
    }

    public long deleteInactiveBefore(LocalDateTime cutoff) {
        return jpaRepository.deleteByExpiresAtBeforeOrRevokedAtBefore(cutoff, cutoff);
    }
}

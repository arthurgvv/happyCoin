package br.com.emoney.repository;

import br.com.emoney.model.AuthSession;
import br.com.emoney.model.UserRole;
import org.springframework.stereotype.Repository;

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
        return jpaRepository.save(new AuthSession(token, userId, role));
    }

    public Optional<AuthSession> findByToken(String token) {
        return jpaRepository.findById(token);
    }
}

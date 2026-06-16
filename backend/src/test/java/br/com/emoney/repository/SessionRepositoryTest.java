package br.com.emoney.repository;

import br.com.emoney.model.AuthSession;
import br.com.emoney.model.UserRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionRepositoryTest {

    @Mock
    private AuthSessionJpaRepository jpaRepository;

    @Test
    void findByTokenReturnsOnlyActiveSessions() {
        SessionRepository repository = new SessionRepository(jpaRepository);
        AuthSession expired = new AuthSession(
                "token",
                UUID.randomUUID(),
                UserRole.STUDENT,
                LocalDateTime.now().minusHours(2),
                LocalDateTime.now().minusHours(1),
                null
        );
        when(jpaRepository.findById("token")).thenReturn(Optional.of(expired));

        assertThat(repository.findByToken("token")).isEmpty();
    }

    @Test
    void revokeMarksExistingSessionAsRevoked() {
        SessionRepository repository = new SessionRepository(jpaRepository);
        AuthSession session = new AuthSession("token", UUID.randomUUID(), UserRole.STUDENT);
        when(jpaRepository.findById("token")).thenReturn(Optional.of(session));

        repository.revoke("token");

        assertThat(session.getRevokedAt()).isNotNull();
        verify(jpaRepository).save(session);
    }

    @Test
    void deleteInactiveBeforeDelegatesToJpaRepository() {
        SessionRepository repository = new SessionRepository(jpaRepository);
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        when(jpaRepository.deleteByExpiresAtBeforeOrRevokedAtBefore(cutoff, cutoff)).thenReturn(3L);

        assertThat(repository.deleteInactiveBefore(cutoff)).isEqualTo(3L);
    }
}

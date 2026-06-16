package br.com.emoney.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class AuthSessionTest {

    @Test
    void activeSessionMustNotBeExpiredOrRevoked() {
        AuthSession session = new AuthSession(
                "token",
                UUID.randomUUID(),
                UserRole.STUDENT,
                LocalDateTime.now().minusMinutes(1),
                LocalDateTime.now().plusMinutes(1),
                null
        );

        assertThat(session.isActive()).isTrue();

        session.revoke();

        assertThat(session.isActive()).isFalse();
        assertThat(session.getRevokedAt()).isNotNull();
    }

    @Test
    void expiredSessionIsInactive() {
        AuthSession session = new AuthSession(
                "token",
                UUID.randomUUID(),
                UserRole.STUDENT,
                LocalDateTime.now().minusHours(2),
                LocalDateTime.now().minusHours(1),
                null
        );

        assertThat(session.isActive()).isFalse();
    }
}

package br.com.emoney.service;

import br.com.emoney.repository.SessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthSessionCleanupServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Test
    void deletesInactiveSessionsOlderThanRetention() {
        AuthSessionCleanupService service = new AuthSessionCleanupService(sessionRepository, Duration.ofDays(7));
        LocalDateTime before = LocalDateTime.now().minusDays(7).minusSeconds(1);

        service.deleteInactiveSessions();

        ArgumentCaptor<LocalDateTime> cutoff = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(sessionRepository).deleteInactiveBefore(cutoff.capture());
        LocalDateTime after = LocalDateTime.now().minusDays(7).plusSeconds(1);
        assertThat(cutoff.getValue()).isBetween(before, after);
    }
}

package br.com.emoney.service;

import br.com.emoney.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class AuthSessionCleanupService {
    private final SessionRepository sessionRepository;
    private final Duration retention;

    public AuthSessionCleanupService(SessionRepository sessionRepository,
                                     @Value("${app.sessions.cleanup.retention:PT168H}") Duration retention) {
        this.sessionRepository = sessionRepository;
        this.retention = retention;
    }

    @Scheduled(fixedDelayString = "${app.sessions.cleanup.fixed-delay-ms:3600000}")
    public void deleteInactiveSessions() {
        sessionRepository.deleteInactiveBefore(LocalDateTime.now().minus(retention));
    }
}

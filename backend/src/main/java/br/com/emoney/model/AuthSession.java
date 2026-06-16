package br.com.emoney.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "auth_sessions")
public class AuthSession {

    @Id
    @Column(name = "token")
    private String token;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    public AuthSession() {
    }

    public AuthSession(String token, UUID userId, UserRole role) {
        this(token, userId, role, LocalDateTime.now(), LocalDateTime.now().plusHours(8), null);
    }

    public AuthSession(String token, UUID userId, UserRole role, LocalDateTime createdAt, LocalDateTime expiresAt, LocalDateTime revokedAt) {
        this.token = token;
        this.userId = userId;
        this.role = role;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.revokedAt = revokedAt;
    }

    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (expiresAt == null) {
            expiresAt = createdAt.plusHours(8);
        }
    }

    public boolean isActive() {
        return revokedAt == null && expiresAt != null && expiresAt.isAfter(LocalDateTime.now());
    }

    public void revoke() {
        revokedAt = LocalDateTime.now();
    }

    public String getToken() { return token; }
    public UUID getUserId() { return userId; }
    public UserRole getRole() { return role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public LocalDateTime getRevokedAt() { return revokedAt; }
}

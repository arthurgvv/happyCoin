package br.com.emoney.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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

    public AuthSession() {
    }

    public AuthSession(String token, UUID userId, UserRole role) {
        this.token = token;
        this.userId = userId;
        this.role = role;
    }

    public String getToken() { return token; }
    public UUID getUserId() { return userId; }
    public UserRole getRole() { return role; }
}

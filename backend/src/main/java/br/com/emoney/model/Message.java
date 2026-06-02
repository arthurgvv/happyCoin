package br.com.emoney.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID fromId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole fromRole;

    private String fromNome;

    @Column(nullable = false)
    private UUID toId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole toRole;

    private String toNome;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    private boolean lido = false;

    private UUID replyToId;

    @Column(nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    public Message() {}

    public Message(UUID fromId, UserRole fromRole, String fromNome,
                   UUID toId, UserRole toRole, String toNome,
                   String subject, String body, UUID replyToId) {
        this.fromId = fromId;
        this.fromRole = fromRole;
        this.fromNome = fromNome;
        this.toId = toId;
        this.toRole = toRole;
        this.toNome = toNome;
        this.subject = subject;
        this.body = body;
        this.replyToId = replyToId;
    }

    public UUID getId() { return id; }
    public UUID getFromId() { return fromId; }
    public UserRole getFromRole() { return fromRole; }
    public String getFromNome() { return fromNome; }
    public UUID getToId() { return toId; }
    public UserRole getToRole() { return toRole; }
    public String getToNome() { return toNome; }
    public String getSubject() { return subject; }
    public String getBody() { return body; }
    public boolean isLido() { return lido; }
    public void setLido(boolean lido) { this.lido = lido; }
    public UUID getReplyToId() { return replyToId; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}

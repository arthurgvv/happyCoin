package br.com.emoney.dto;

import br.com.emoney.model.Message;

import java.time.LocalDateTime;
import java.util.UUID;

public class MessageResponse {
    private UUID id;
    private UUID fromId;
    private String fromRole;
    private String fromNome;
    private UUID toId;
    private String toRole;
    private String toNome;
    private String subject;
    private String body;
    private boolean lido;
    private UUID replyToId;
    private String type;
    private UUID purchaseId;
    private LocalDateTime criadoEm;

    public MessageResponse(Message m) {
        this.id = m.getId();
        this.fromId = m.getFromId();
        this.fromRole = m.getFromRole().name();
        this.fromNome = m.getFromNome();
        this.toId = m.getToId();
        this.toRole = m.getToRole().name();
        this.toNome = m.getToNome();
        this.subject = m.getSubject();
        this.body = m.getBody();
        this.lido = m.isLido();
        this.replyToId = m.getReplyToId();
        this.type = m.getType();
        this.purchaseId = m.getPurchaseId();
        this.criadoEm = m.getCriadoEm();
    }

    public UUID getId() { return id; }
    public UUID getFromId() { return fromId; }
    public String getFromRole() { return fromRole; }
    public String getFromNome() { return fromNome; }
    public UUID getToId() { return toId; }
    public String getToRole() { return toRole; }
    public String getToNome() { return toNome; }
    public String getSubject() { return subject; }
    public String getBody() { return body; }
    public boolean isLido() { return lido; }
    public UUID getReplyToId() { return replyToId; }
    public String getType() { return type; }
    public UUID getPurchaseId() { return purchaseId; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}

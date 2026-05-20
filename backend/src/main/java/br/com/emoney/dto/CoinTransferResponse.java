package br.com.emoney.dto;

import br.com.emoney.model.CoinTransfer;

import java.time.LocalDateTime;
import java.util.UUID;

public class CoinTransferResponse {
    private UUID id;
    private UUID professorId;
    private UUID studentId;
    private String studentName;
    private String studentEmail;
    private String studentCourse;
    private String professorName;
    private int quantidade;
    private String motivo;
    private LocalDateTime criadoEm;

    public CoinTransferResponse(CoinTransfer t) {
        this.id = t.getId();
        this.professorId = t.getProfessorId();
        this.studentId = t.getStudentId();
        this.quantidade = t.getQuantidade();
        this.motivo = t.getMotivo();
        this.criadoEm = t.getCriadoEm();
    }

    public CoinTransferResponse withStudentName(String name, String email) {
        this.studentName = name;
        this.studentEmail = email;
        return this;
    }

    public CoinTransferResponse withStudentInfo(String name, String email, String course) {
        this.studentName = name;
        this.studentEmail = email;
        this.studentCourse = course;
        return this;
    }

    public CoinTransferResponse withProfessorName(String name) {
        this.professorName = name;
        return this;
    }

    public UUID getId() { return id; }
    public UUID getProfessorId() { return professorId; }
    public UUID getStudentId() { return studentId; }
    public String getStudentName() { return studentName; }
    public String getStudentEmail() { return studentEmail; }
    public String getStudentCourse() { return studentCourse; }
    public String getProfessorName() { return professorName; }
    public int getQuantidade() { return quantidade; }
    public String getMotivo() { return motivo; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}

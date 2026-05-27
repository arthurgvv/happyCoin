package br.com.emoney.service;

import br.com.emoney.dto.ProfessorResponse;
import br.com.emoney.dto.TransferCoinsRequest;
import br.com.emoney.dto.UpdateProfessorRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.CoinTransfer;
import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.ProfessorRepository;
import br.com.emoney.repository.TransferRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ProfessorService {
    private final ProfessorRepository professorRepository;
    private final StudentService studentService;
    private final TransferRepository transferRepository;
    private final ValidationService validationService;
    private final EmailService emailService;

    public ProfessorService(ProfessorRepository professorRepository, StudentService studentService, TransferRepository transferRepository, ValidationService validationService, EmailService emailService) {
        this.professorRepository = professorRepository;
        this.studentService = studentService;
        this.transferRepository = transferRepository;
        this.validationService = validationService;
        this.emailService = emailService;
    }

    public Professor findEntityById(java.util.UUID professorId) {
        return professorRepository.findById(professorId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Professor nao encontrado."));
    }

    public ProfessorResponse transfer(AuthSession session, TransferCoinsRequest request) {
        if (session.getRole() != UserRole.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem enviar moedas.");
        }

        Professor professor = findEntityById(session.getUserId());

        if (request.getQuantidade() <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Quantidade deve ser maior que zero.");
        }

        String motivo = validationService.text(request.getMotivo(), "Motivo");

        if (professor.getSaldoMoedas() < request.getQuantidade()) {
            throw new ResponseStatusException(BAD_REQUEST, "Professor nao possui saldo suficiente.");
        }

        Student student = studentService.findEntityById(request.getStudentId());
        if (professor.getInstitutionId() == null
                || student.getInstitutionId() == null
                || !professor.getInstitutionId().equals(student.getInstitutionId())
                || professor.getCursos() == null
                || !professor.getCursos().contains(student.getCurso())) {
            throw new ResponseStatusException(BAD_REQUEST, "Professor so pode enviar moedas para alunos dos cursos atribuidos.");
        }

        professor.setSaldoMoedas(professor.getSaldoMoedas() - request.getQuantidade());
        student.setSaldoMoedas(student.getSaldoMoedas() + request.getQuantidade());
        professor.setUltimoAviso("Transferencia realizada com sucesso.");
        student.setUltimoAviso("Voce recebeu " + request.getQuantidade() + " moedas. Motivo: " + motivo);

        professorRepository.save(professor);
        studentService.save(student);
        transferRepository.save(new CoinTransfer(professor.getId(), student.getId(), request.getQuantidade(), motivo));
        emailService.sendCoinTransferConfirmation(professor, student, request.getQuantidade(), motivo);
        emailService.sendCoinReceivedNotification(professor, student, request.getQuantidade(), motivo);

        return new ProfessorResponse(professor);
    }

    public ProfessorResponse update(java.util.UUID professorId, UpdateProfessorRequest request) {
        Professor professor = findEntityById(professorId);

        if (request.getNome() != null && !request.getNome().isBlank()) {
            professor.setNome(validationService.text(request.getNome(), "Nome"));
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String email = request.getEmail().toLowerCase();
            professorRepository.findByEmail(email).ifPresent(existing -> {
                if (!existing.getId().equals(professorId)) {
                    throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT, "Ja existe professor com este email.");
                }
            });
            professor.setEmail(email);
        }
        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            professor.setSenha(validationService.senha(request.getSenha()));
        }
        if (request.getCursos() != null && !request.getCursos().isEmpty()) {
            professor.setCursos(validationService.cursos(request.getCursos()));
        }
        if (request.getPhotoUrl() != null) {
            professor.setPhotoUrl(request.getPhotoUrl());
        }

        return new ProfessorResponse(professorRepository.save(professor));
    }
}

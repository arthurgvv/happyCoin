package br.com.emoney.service;

import br.com.emoney.dto.ProfessorResponse;
import br.com.emoney.dto.TransferCoinsRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.CoinTransfer;
import br.com.emoney.model.Message;
import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.MessageRepository;
import br.com.emoney.repository.ProfessorRepository;
import br.com.emoney.repository.TransferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CoinTransferService {
    private final ProfessorRepository professorRepository;
    private final StudentService studentService;
    private final TransferRepository transferRepository;
    private final MessageRepository messageRepository;
    private final ValidationService validationService;
    private final EmailService emailService;
    private final AuthorizationService authorizationService;

    public CoinTransferService(ProfessorRepository professorRepository, StudentService studentService,
                               TransferRepository transferRepository, MessageRepository messageRepository,
                               ValidationService validationService, EmailService emailService,
                               AuthorizationService authorizationService) {
        this.professorRepository = professorRepository;
        this.studentService = studentService;
        this.transferRepository = transferRepository;
        this.messageRepository = messageRepository;
        this.validationService = validationService;
        this.emailService = emailService;
        this.authorizationService = authorizationService;
    }

    @Transactional
    public ProfessorResponse transfer(AuthSession session, TransferCoinsRequest request) {
        authorizationService.requireRole(session, UserRole.PROFESSOR, "Apenas professores podem enviar moedas.");

        Professor professor = professorRepository.findById(session.getUserId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Professor nao encontrado."));

        if (request.getQuantidade() <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Quantidade deve ser maior que zero.");
        }

        String motivo = validationService.text(request.getMotivo(), "Motivo");

        if (professor.getSaldoMoedas() < request.getQuantidade()) {
            throw new ResponseStatusException(BAD_REQUEST, "Professor nao possui saldo suficiente.");
        }

        Student student = studentService.findEntityById(request.getStudentId());
        authorizationService.requireProfessorCanInteractWithStudent(
                professor,
                student,
                "Professor so pode enviar moedas para alunos dos cursos atribuidos."
        );

        professor.debitCoins(request.getQuantidade());
        student.creditCoins(request.getQuantidade());
        professor.setUltimoAviso("Transferencia realizada com sucesso.");
        student.setUltimoAviso("Voce recebeu " + request.getQuantidade() + " moedas. Motivo: " + motivo);

        professorRepository.save(professor);
        studentService.save(student);
        transferRepository.save(new CoinTransfer(professor.getId(), student.getId(), request.getQuantidade(), motivo));
        messageRepository.save(new Message(
                professor.getId(), UserRole.PROFESSOR, professor.getNome(),
                student.getId(), UserRole.STUDENT, student.getNome(),
                "Voce recebeu " + request.getQuantidade() + " moedas",
                "Voce recebeu " + request.getQuantidade() + " HappyCoins de " + professor.getNome() + ".\n\nMotivo: " + motivo,
                null
        ).withType("COIN_TRANSFER"));
        emailService.sendCoinTransferConfirmation(professor, student, request.getQuantidade(), motivo);
        emailService.sendCoinReceivedNotification(professor, student, request.getQuantidade(), motivo);

        return new ProfessorResponse(professor);
    }

}

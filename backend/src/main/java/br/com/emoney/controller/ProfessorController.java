package br.com.emoney.controller;

import br.com.emoney.dto.CoinTransferResponse;
import br.com.emoney.dto.MessageResponse;
import br.com.emoney.dto.ProfessorResponse;
import br.com.emoney.dto.SendEmailRequest;
import br.com.emoney.dto.StudentResponse;
import br.com.emoney.dto.TransferCoinsRequest;
import br.com.emoney.dto.UpdateProfessorRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Message;
import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.InstitutionRepository;
import br.com.emoney.repository.MessageRepository;
import br.com.emoney.repository.StudentRepository;
import br.com.emoney.repository.TransferRepository;
import br.com.emoney.service.AuthService;
import br.com.emoney.service.EmailService;
import br.com.emoney.service.ProfessorService;
import br.com.emoney.service.StudentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/professors")
public class ProfessorController {
    private final AuthService authService;
    private final ProfessorService professorService;
    private final StudentService studentService;
    private final TransferRepository transferRepository;
    private final StudentRepository studentRepository;
    private final InstitutionRepository institutionRepository;
    private final EmailService emailService;
    private final MessageRepository messageRepository;

    public ProfessorController(AuthService authService, ProfessorService professorService, StudentService studentService, TransferRepository transferRepository, StudentRepository studentRepository, InstitutionRepository institutionRepository, EmailService emailService, MessageRepository messageRepository) {
        this.authService = authService;
        this.professorService = professorService;
        this.studentService = studentService;
        this.transferRepository = transferRepository;
        this.studentRepository = studentRepository;
        this.institutionRepository = institutionRepository;
        this.emailService = emailService;
        this.messageRepository = messageRepository;
    }

    @PostMapping("/transfer")
    public ProfessorResponse transfer(@RequestHeader("Authorization") String authorization, @RequestBody TransferCoinsRequest request) {
        AuthSession session = authService.requireSession(authorization);
        return professorService.transfer(session, request);
    }

    @GetMapping("/me/courses")
    public java.util.List<String> courses(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        Professor professor = professorService.findEntityById(session.getUserId());
        return professor.getCursos().stream().distinct().toList();
    }

    @GetMapping("/me/courses/{course}/students")
    public java.util.List<StudentResponse> studentsByCourse(@RequestHeader("Authorization") String authorization, @PathVariable String course) {
        AuthSession session = authService.requireSession(authorization);
        Professor professor = professorService.findEntityById(session.getUserId());
        if (!professor.getCursos().contains(course)) {
            throw new ResponseStatusException(BAD_REQUEST, "Professor so pode acessar alunos dos cursos atribuidos.");
        }
        return studentService.listByInstitutionAndCourse(professor.getInstitutionId(), course);
    }

    @GetMapping("/me")
    public ProfessorResponse me(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem acessar esta area.");
        }
        Professor professor = professorService.findEntityById(session.getUserId());
        ProfessorResponse response = new ProfessorResponse(professor);
        if (professor.getInstitutionId() != null) {
            institutionRepository.findById(professor.getInstitutionId()).ifPresent(inst ->
                    response.setInstitutionName(inst.getNome()));
        }
        return response;
    }

    @PutMapping("/me")
    public ProfessorResponse update(@RequestHeader("Authorization") String authorization, @RequestBody UpdateProfessorRequest request) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem acessar esta area.");
        }
        return professorService.update(session.getUserId(), request);
    }

    @PostMapping("/me/send-email")
    public void sendEmail(@RequestHeader("Authorization") String authorization, @RequestBody SendEmailRequest request) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem enviar emails.");
        }
        if (request.getSubject() == null || request.getSubject().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Assunto nao pode ser vazio.");
        }
        if (request.getBody() == null || request.getBody().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Mensagem nao pode ser vazia.");
        }
        Professor professor = professorService.findEntityById(session.getUserId());
        Student student = studentService.findEntityById(request.getStudentId());
        if (professor.getInstitutionId() == null
                || !professor.getInstitutionId().equals(student.getInstitutionId())
                || professor.getCursos() == null
                || !professor.getCursos().contains(student.getCurso())) {
            throw new ResponseStatusException(BAD_REQUEST, "Professor so pode enviar emails para alunos dos cursos atribuidos.");
        }
        messageRepository.save(new Message(
                professor.getId(), UserRole.PROFESSOR, professor.getNome(),
                student.getId(), UserRole.STUDENT, student.getNome(),
                request.getSubject(), request.getBody(), request.getReplyToId()));
        emailService.sendDirectMessage(professor, student, request.getSubject(), request.getBody());
    }

    @GetMapping("/me/inbox")
    public java.util.List<MessageResponse> inbox(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem acessar esta area.");
        }
        return messageRepository.findByToIdOrderByCriadoEmDesc(session.getUserId())
                .stream().map(MessageResponse::new).toList();
    }

    @PutMapping("/me/inbox/{id}/read")
    public void markRead(@RequestHeader("Authorization") String authorization, @PathVariable java.util.UUID id) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem acessar esta area.");
        }
        Message msg = messageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Mensagem nao encontrada."));
        if (!msg.getToId().equals(session.getUserId())) {
            throw new ResponseStatusException(FORBIDDEN, "Acesso negado.");
        }
        msg.setLido(true);
        messageRepository.save(msg);
    }

    @GetMapping("/me/sent")
    public java.util.List<MessageResponse> sent(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem acessar esta area.");
        }
        return messageRepository.findByFromIdOrderByCriadoEmDesc(session.getUserId())
                .stream()
                .filter(message -> message.getType() == null || !message.getType().startsWith("COIN_"))
                .filter(message -> message.getSubject() == null || !message.getSubject().startsWith("Voce recebeu "))
                .map(MessageResponse::new)
                .toList();
    }

    @GetMapping("/me/transfers")
    public java.util.List<CoinTransferResponse> transfers(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem acessar esta area.");
        }
        return transferRepository.findByProfessorIdOrderByCriadoEmDesc(session.getUserId())
                .stream()
                .map(t -> {
                    CoinTransferResponse r = new CoinTransferResponse(t);
                    studentRepository.findById(t.getStudentId()).ifPresent(s ->
                            r.withStudentInfo(s.getNome(), s.getEmail(), s.getCurso(), s.getPhotoUrl()));
                    return r;
                })
                .toList();
    }
}

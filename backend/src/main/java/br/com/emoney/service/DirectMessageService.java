package br.com.emoney.service;

import br.com.emoney.dto.SendEmailRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Message;
import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.MessageRepository;
import br.com.emoney.repository.ProfessorRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class DirectMessageService {
    private final ProfessorService professorService;
    private final StudentService studentService;
    private final ProfessorRepository professorRepository;
    private final MessageRepository messageRepository;
    private final EmailService emailService;
    private final AuthorizationService authorizationService;

    public DirectMessageService(ProfessorService professorService, StudentService studentService,
                                ProfessorRepository professorRepository, MessageRepository messageRepository,
                                EmailService emailService, AuthorizationService authorizationService) {
        this.professorService = professorService;
        this.studentService = studentService;
        this.professorRepository = professorRepository;
        this.messageRepository = messageRepository;
        this.emailService = emailService;
        this.authorizationService = authorizationService;
    }

    public void sendFromProfessor(AuthSession session, SendEmailRequest request) {
        authorizationService.requireRole(session, UserRole.PROFESSOR, "Apenas professores podem enviar emails.");

        Professor professor = professorService.findEntityById(session.getUserId());
        Student student = studentService.findEntityById(request.getStudentId());
        authorizationService.requireProfessorCanInteractWithStudent(
                professor,
                student,
                "Professor so pode enviar emails para alunos dos cursos atribuidos."
        );

        messageRepository.save(new Message(
                professor.getId(), UserRole.PROFESSOR, professor.getNome(),
                student.getId(), UserRole.STUDENT, student.getNome(),
                request.getSubject(), request.getBody(), request.getReplyToId()
        ));
        emailService.sendDirectMessage(professor, student, request.getSubject(), request.getBody());
    }

    public void sendFromStudent(AuthSession session, SendEmailRequest request) {
        authorizationService.requireRole(session, UserRole.STUDENT, "Apenas alunos podem enviar emails.");

        Student student = studentService.findEntityById(session.getUserId());
        Professor professor = professorRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Professor nao encontrado."));
        authorizationService.requireStudentCanInteractWithProfessor(
                student,
                professor,
                "Aluno so pode enviar emails para professores do seu curso."
        );

        messageRepository.save(new Message(
                student.getId(), UserRole.STUDENT, student.getNome(),
                professor.getId(), UserRole.PROFESSOR, professor.getNome(),
                request.getSubject(), request.getBody(), request.getReplyToId()
        ));
        emailService.sendDirectMessage(student, professor, request.getSubject(), request.getBody());
    }
}

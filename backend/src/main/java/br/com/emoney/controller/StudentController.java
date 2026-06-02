package br.com.emoney.controller;

import br.com.emoney.dto.CoinTransferResponse;
import br.com.emoney.dto.MessageResponse;
import br.com.emoney.dto.ProductPurchaseResponse;
import br.com.emoney.dto.SendEmailRequest;
import br.com.emoney.dto.StudentResponse;
import br.com.emoney.dto.UpdateStudentRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Message;
import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.CompanyRepository;
import br.com.emoney.repository.MessageRepository;
import br.com.emoney.repository.ProfessorRepository;
import br.com.emoney.repository.ProductRepository;
import br.com.emoney.repository.ProductPurchaseRepository;
import br.com.emoney.repository.TransferRepository;
import br.com.emoney.service.AuthService;
import br.com.emoney.service.EmailService;
import br.com.emoney.service.InstitutionService;
import br.com.emoney.service.StudentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.FORBIDDEN;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentService studentService;
    private final AuthService authService;
    private final InstitutionService institutionService;
    private final TransferRepository transferRepository;
    private final ProductPurchaseRepository purchaseRepository;
    private final ProfessorRepository professorRepository;
    private final CompanyRepository companyRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    private final MessageRepository messageRepository;

    public StudentController(StudentService studentService, AuthService authService, InstitutionService institutionService, TransferRepository transferRepository, ProductPurchaseRepository purchaseRepository, ProfessorRepository professorRepository, CompanyRepository companyRepository, ProductRepository productRepository, EmailService emailService, MessageRepository messageRepository) {
        this.studentService = studentService;
        this.authService = authService;
        this.institutionService = institutionService;
        this.transferRepository = transferRepository;
        this.purchaseRepository = purchaseRepository;
        this.professorRepository = professorRepository;
        this.companyRepository = companyRepository;
        this.productRepository = productRepository;
        this.emailService = emailService;
        this.messageRepository = messageRepository;
    }

    @GetMapping
    public List<StudentResponse> list() {
        return studentService.list();
    }

    @GetMapping("/me")
    public StudentResponse me(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas alunos podem acessar esta area.");
        }
        return studentService.findById(session.getUserId());
    }

    @PutMapping("/me")
    public StudentResponse updateMe(@RequestHeader("Authorization") String authorization, @RequestBody UpdateStudentRequest request) {
        AuthSession session = authService.requireSession(authorization);
        return studentService.update(session.getUserId(), request);
    }

    @GetMapping("/me/transfers")
    public List<CoinTransferResponse> myTransfers(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas alunos podem acessar esta area.");
        }
        return transferRepository.findByStudentIdOrderByCriadoEmDesc(session.getUserId())
                .stream()
                .map(t -> {
                    CoinTransferResponse r = new CoinTransferResponse(t);
                    professorRepository.findById(t.getProfessorId()).ifPresent(p ->
                            r.withProfessorInfo(p.getNome(), p.getPhotoUrl()));
                    return r;
                })
                .toList();
    }

    @GetMapping("/me/purchases")
    public List<ProductPurchaseResponse> myPurchases(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas alunos podem acessar esta area.");
        }
        return purchaseRepository.findByStudentIdOrderByCriadoEmDesc(session.getUserId())
                .stream()
                .map(purchase -> {
                    ProductPurchaseResponse response = new ProductPurchaseResponse(purchase);
                    if (purchase.getCompanyId() != null) {
                        companyRepository.findById(purchase.getCompanyId())
                                .ifPresent(company -> response.withCompanyInfo(company.getNomeFantasia(), company.getPhotoUrl()));
                    }
                    if (purchase.getProductId() != null) {
                        productRepository.findById(purchase.getProductId())
                                .ifPresent(product -> response.withProductImage(product.getImageUrl()));
                    }
                    return response;
                })
                .toList();
    }

    @GetMapping("/institutions")
    public List<String> institutions() {
        return institutionService.listInstitutionNames();
    }

    @GetMapping("/me/professors")
    public List<java.util.Map<String, String>> myProfessors(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas alunos podem acessar esta area.");
        }
        Student student = studentService.findEntityById(session.getUserId());
        if (student.getInstitutionId() == null) return List.of();
        return professorRepository.findByInstitutionId(student.getInstitutionId()).stream()
                .filter(p -> p.getCursos() != null && p.getCursos().stream().anyMatch(course -> sameCourse(course, student.getCurso())))
                .map(p -> java.util.Map.of(
                        "id", p.getId().toString(),
                        "nome", p.getNome(),
                        "email", p.getEmail()
                ))
                .toList();
    }

    @PostMapping("/me/send-email")
    public void sendEmail(@RequestHeader("Authorization") String authorization, @RequestBody SendEmailRequest request) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas alunos podem enviar emails.");
        }
        if (request.getSubject() == null || request.getSubject().isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Assunto nao pode ser vazio.");
        }
        if (request.getBody() == null || request.getBody().isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Mensagem nao pode ser vazia.");
        }
        Student student = studentService.findEntityById(session.getUserId());
        Professor professor = professorRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Professor nao encontrado."));
        if (student.getInstitutionId() == null
                || !student.getInstitutionId().equals(professor.getInstitutionId())
                || professor.getCursos() == null
                || professor.getCursos().stream().noneMatch(course -> sameCourse(course, student.getCurso()))) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Aluno so pode enviar emails para professores do seu curso.");
        }
        messageRepository.save(new Message(
                student.getId(), UserRole.STUDENT, student.getNome(),
                professor.getId(), UserRole.PROFESSOR, professor.getNome(),
                request.getSubject(), request.getBody(), request.getReplyToId()));
        emailService.sendDirectMessage(student, professor, request.getSubject(), request.getBody());
    }

    @GetMapping("/me/sent")
    public List<MessageResponse> sent(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas alunos podem acessar esta area.");
        }
        return messageRepository.findByFromIdOrderByCriadoEmDesc(session.getUserId())
                .stream().map(MessageResponse::new).toList();
    }

    @GetMapping("/me/inbox")
    public List<MessageResponse> inbox(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas alunos podem acessar esta area.");
        }
        return messageRepository.findByToIdOrderByCriadoEmDesc(session.getUserId())
                .stream().map(MessageResponse::new).toList();
    }

    @org.springframework.web.bind.annotation.PutMapping("/me/inbox/{id}/read")
    public void markRead(@RequestHeader("Authorization") String authorization,
                         @org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas alunos podem acessar esta area.");
        }
        Message msg = messageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Mensagem nao encontrada."));
        if (!msg.getToId().equals(session.getUserId())) {
            throw new ResponseStatusException(FORBIDDEN, "Acesso negado.");
        }
        msg.setLido(true);
        messageRepository.save(msg);
    }

    private boolean sameCourse(String professorCourse, String studentCourse) {
        if (professorCourse == null || studentCourse == null) {
            return false;
        }
        return professorCourse.trim().equalsIgnoreCase(studentCourse.trim());
    }
}

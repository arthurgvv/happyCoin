package br.com.emoney.controller;

import br.com.emoney.dto.CoinTransferResponse;
import br.com.emoney.dto.MessageResponse;
import br.com.emoney.dto.ProductPurchaseResponse;
import br.com.emoney.dto.SendEmailRequest;
import br.com.emoney.dto.StudentResponse;
import br.com.emoney.dto.UpdateStudentRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.service.AuthService;
import br.com.emoney.service.AuthorizationService;
import br.com.emoney.service.DirectMessageService;
import br.com.emoney.service.InstitutionService;
import br.com.emoney.service.MessageService;
import br.com.emoney.service.StatementService;
import br.com.emoney.service.StudentDirectoryService;
import br.com.emoney.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentService studentService;
    private final AuthService authService;
    private final InstitutionService institutionService;
    private final MessageService messageService;
    private final StatementService statementService;
    private final DirectMessageService directMessageService;
    private final StudentDirectoryService studentDirectoryService;
    private final AuthorizationService authorizationService;

    public StudentController(StudentService studentService, AuthService authService, InstitutionService institutionService, MessageService messageService, StatementService statementService, DirectMessageService directMessageService, StudentDirectoryService studentDirectoryService, AuthorizationService authorizationService) {
        this.studentService = studentService;
        this.authService = authService;
        this.institutionService = institutionService;
        this.messageService = messageService;
        this.statementService = statementService;
        this.directMessageService = directMessageService;
        this.studentDirectoryService = studentDirectoryService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public List<StudentResponse> list() {
        return studentService.list();
    }

    @GetMapping("/me")
    public StudentResponse me(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireStudent(session);
        return studentService.findById(session.getUserId());
    }

    @PutMapping("/me")
    public StudentResponse updateMe(@RequestHeader("Authorization") String authorization, @Valid @RequestBody UpdateStudentRequest request) {
        AuthSession session = authService.requireSession(authorization);
        return studentService.update(session.getUserId(), request);
    }

    @GetMapping("/me/transfers")
    public List<CoinTransferResponse> myTransfers(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        return statementService.transfersForStudent(session);
    }

    @GetMapping("/me/purchases")
    public List<ProductPurchaseResponse> myPurchases(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        return statementService.purchasesForStudent(session);
    }

    @GetMapping("/institutions")
    public List<String> institutions() {
        return institutionService.listInstitutionNames();
    }

    @GetMapping("/me/professors")
    public List<java.util.Map<String, String>> myProfessors(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        return studentDirectoryService.professorsForStudent(session);
    }

    @PostMapping("/me/send-email")
    public void sendEmail(@RequestHeader("Authorization") String authorization, @Valid @RequestBody SendEmailRequest request) {
        AuthSession session = authService.requireSession(authorization);
        directMessageService.sendFromStudent(session, request);
    }

    @GetMapping("/me/sent")
    public List<MessageResponse> sent(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireStudent(session);
        return messageService.sent(session);
    }

    @GetMapping("/me/inbox")
    public List<MessageResponse> inbox(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireStudent(session);
        return messageService.inbox(session);
    }

    @org.springframework.web.bind.annotation.PutMapping("/me/inbox/{id}/read")
    public void markRead(@RequestHeader("Authorization") String authorization,
                         @org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireStudent(session);
        messageService.markRead(session, id);
    }
}

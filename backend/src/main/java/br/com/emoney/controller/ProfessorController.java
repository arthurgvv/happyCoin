package br.com.emoney.controller;

import br.com.emoney.dto.CoinTransferResponse;
import br.com.emoney.dto.MessageResponse;
import br.com.emoney.dto.ProfessorResponse;
import br.com.emoney.dto.SendEmailRequest;
import br.com.emoney.dto.StudentResponse;
import br.com.emoney.dto.TransferCoinsRequest;
import br.com.emoney.dto.UpdateProfessorRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.service.AuthService;
import br.com.emoney.service.AuthorizationService;
import br.com.emoney.service.CoinTransferService;
import br.com.emoney.service.DirectMessageService;
import br.com.emoney.service.MessageService;
import br.com.emoney.service.ProfessorDirectoryService;
import br.com.emoney.service.ProfessorService;
import br.com.emoney.service.StatementService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/professors")
public class ProfessorController {
    private final AuthService authService;
    private final ProfessorService professorService;
    private final CoinTransferService coinTransferService;
    private final MessageService messageService;
    private final StatementService statementService;
    private final DirectMessageService directMessageService;
    private final AuthorizationService authorizationService;
    private final ProfessorDirectoryService professorDirectoryService;

    public ProfessorController(AuthService authService, ProfessorService professorService, CoinTransferService coinTransferService, MessageService messageService, StatementService statementService, DirectMessageService directMessageService, AuthorizationService authorizationService, ProfessorDirectoryService professorDirectoryService) {
        this.authService = authService;
        this.professorService = professorService;
        this.coinTransferService = coinTransferService;
        this.messageService = messageService;
        this.statementService = statementService;
        this.directMessageService = directMessageService;
        this.authorizationService = authorizationService;
        this.professorDirectoryService = professorDirectoryService;
    }

    @PostMapping("/transfer")
    public ProfessorResponse transfer(@RequestHeader("Authorization") String authorization, @Valid @RequestBody TransferCoinsRequest request) {
        AuthSession session = authService.requireSession(authorization);
        return coinTransferService.transfer(session, request);
    }

    @GetMapping("/me/courses")
    public java.util.List<String> courses(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        return professorDirectoryService.courses(session);
    }

    @GetMapping("/me/courses/{course}/students")
    public java.util.List<StudentResponse> studentsByCourse(@RequestHeader("Authorization") String authorization, @PathVariable String course) {
        AuthSession session = authService.requireSession(authorization);
        return professorDirectoryService.studentsByCourse(session, course);
    }

    @GetMapping("/me")
    public ProfessorResponse me(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireProfessor(session);
        return professorService.findById(session.getUserId());
    }

    @PutMapping("/me")
    public ProfessorResponse update(@RequestHeader("Authorization") String authorization, @Valid @RequestBody UpdateProfessorRequest request) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireProfessor(session);
        return professorService.update(session.getUserId(), request);
    }

    @PostMapping("/me/send-email")
    public void sendEmail(@RequestHeader("Authorization") String authorization, @Valid @RequestBody SendEmailRequest request) {
        AuthSession session = authService.requireSession(authorization);
        directMessageService.sendFromProfessor(session, request);
    }

    @GetMapping("/me/inbox")
    public java.util.List<MessageResponse> inbox(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireProfessor(session);
        return messageService.inbox(session);
    }

    @PutMapping("/me/inbox/{id}/read")
    public void markRead(@RequestHeader("Authorization") String authorization, @PathVariable java.util.UUID id) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireProfessor(session);
        messageService.markRead(session, id);
    }

    @GetMapping("/me/sent")
    public java.util.List<MessageResponse> sent(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireProfessor(session);
        return messageService.sent(session);
    }

    @GetMapping("/me/transfers")
    public java.util.List<CoinTransferResponse> transfers(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireProfessor(session);
        return statementService.transfersForProfessor(session);
    }
}

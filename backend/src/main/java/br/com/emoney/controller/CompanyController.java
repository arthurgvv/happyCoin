package br.com.emoney.controller;

import br.com.emoney.dto.CompanyResponse;
import br.com.emoney.dto.MessageResponse;
import br.com.emoney.dto.UpdateCompanyRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.service.AuthService;
import br.com.emoney.service.AuthorizationService;
import br.com.emoney.service.CompanyService;
import br.com.emoney.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {
    private final AuthService authService;
    private final CompanyService companyService;
    private final MessageService messageService;
    private final AuthorizationService authorizationService;

    public CompanyController(AuthService authService, CompanyService companyService, MessageService messageService,
                             AuthorizationService authorizationService) {
        this.authService = authService;
        this.companyService = companyService;
        this.messageService = messageService;
        this.authorizationService = authorizationService;
    }

    @GetMapping("/me")
    public CompanyResponse me(@RequestHeader("Authorization") String authorization) {
        AuthSession session = requireCompanySession(authorization);
        return companyService.findById(session.getUserId());
    }

    @PutMapping("/me")
    public CompanyResponse update(@RequestHeader("Authorization") String authorization, @Valid @RequestBody UpdateCompanyRequest request) {
        AuthSession session = requireCompanySession(authorization);
        return companyService.update(session.getUserId(), request);
    }

    @GetMapping("/me/inbox")
    public List<MessageResponse> inbox(@RequestHeader("Authorization") String authorization) {
        AuthSession session = requireCompanySession(authorization);
        return messageService.inbox(session);
    }

    @PutMapping("/me/inbox/{id}/read")
    public void markRead(@RequestHeader("Authorization") String authorization, @PathVariable UUID id) {
        AuthSession session = requireCompanySession(authorization);
        messageService.markRead(session, id);
    }

    private AuthSession requireCompanySession(String authorization) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireCompany(session);
        return session;
    }
}

package br.com.emoney.controller;

import br.com.emoney.dto.CompanyResponse;
import br.com.emoney.dto.MessageResponse;
import br.com.emoney.dto.UpdateCompanyRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Message;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.MessageRepository;
import br.com.emoney.service.AuthService;
import br.com.emoney.service.CompanyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {
    private final AuthService authService;
    private final CompanyService companyService;
    private final MessageRepository messageRepository;

    public CompanyController(AuthService authService, CompanyService companyService, MessageRepository messageRepository) {
        this.authService = authService;
        this.companyService = companyService;
        this.messageRepository = messageRepository;
    }

    @GetMapping("/me")
    public CompanyResponse me(@RequestHeader("Authorization") String authorization) {
        AuthSession session = requireCompanySession(authorization);
        return companyService.findById(session.getUserId());
    }

    @PutMapping("/me")
    public CompanyResponse update(@RequestHeader("Authorization") String authorization, @RequestBody UpdateCompanyRequest request) {
        AuthSession session = requireCompanySession(authorization);
        return companyService.update(session.getUserId(), request);
    }

    @GetMapping("/me/inbox")
    public List<MessageResponse> inbox(@RequestHeader("Authorization") String authorization) {
        AuthSession session = requireCompanySession(authorization);
        return messageRepository.findByToIdOrderByCriadoEmDesc(session.getUserId())
                .stream()
                .map(MessageResponse::new)
                .toList();
    }

    @PutMapping("/me/inbox/{id}/read")
    public void markRead(@RequestHeader("Authorization") String authorization, @PathVariable UUID id) {
        AuthSession session = requireCompanySession(authorization);
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Mensagem nao encontrada."));
        if (!message.getToId().equals(session.getUserId())) {
            throw new ResponseStatusException(FORBIDDEN, "Acesso negado.");
        }
        message.setLido(true);
        messageRepository.save(message);
    }

    private AuthSession requireCompanySession(String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.COMPANY) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas empresas podem acessar esta area.");
        }
        return session;
    }
}

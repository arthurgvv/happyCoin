package br.com.emoney.service.auth;

import br.com.emoney.dto.AuthResponse;
import br.com.emoney.dto.CompanyResponse;
import br.com.emoney.dto.LoginRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Company;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.SessionRepository;
import br.com.emoney.service.CompanyService;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Component
@Order(3)
public class CompanyAuthenticationProvider implements RoleAuthenticationProvider {
    private final CompanyService companyService;
    private final SessionRepository sessionRepository;

    public CompanyAuthenticationProvider(CompanyService companyService, SessionRepository sessionRepository) {
        this.companyService = companyService;
        this.sessionRepository = sessionRepository;
    }

    @Override
    public Optional<AuthResponse> authenticate(LoginRequest request) {
        try {
            Company company = companyService.authenticate(request.getEmail(), request.getSenha());
            AuthSession session = sessionRepository.create(company.getId(), UserRole.COMPANY);
            return Optional.of(new AuthResponse(session.getToken(), UserRole.COMPANY, new CompanyResponse(company)));
        } catch (ResponseStatusException ignored) {
            return Optional.empty();
        }
    }
}

package br.com.emoney.service.auth;

import br.com.emoney.dto.AuthResponse;
import br.com.emoney.dto.InstitutionResponse;
import br.com.emoney.dto.LoginRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Institution;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.SessionRepository;
import br.com.emoney.service.InstitutionService;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Component
@Order(2)
public class InstitutionAuthenticationProvider implements RoleAuthenticationProvider {
    private final InstitutionService institutionService;
    private final SessionRepository sessionRepository;

    public InstitutionAuthenticationProvider(InstitutionService institutionService, SessionRepository sessionRepository) {
        this.institutionService = institutionService;
        this.sessionRepository = sessionRepository;
    }

    @Override
    public Optional<AuthResponse> authenticate(LoginRequest request) {
        try {
            Institution institution = institutionService.authenticate(request.getEmail(), request.getSenha());
            AuthSession session = sessionRepository.create(institution.getId(), UserRole.INSTITUTION);
            return Optional.of(new AuthResponse(
                    session.getToken(),
                    UserRole.INSTITUTION,
                    new InstitutionResponse(institution, institutionService.listProfessors(institution.getId()))
            ));
        } catch (ResponseStatusException ignored) {
            return Optional.empty();
        }
    }
}

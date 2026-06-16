package br.com.emoney.service.auth;

import br.com.emoney.dto.AuthResponse;
import br.com.emoney.dto.LoginRequest;
import br.com.emoney.dto.ProfessorResponse;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Professor;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.ProfessorRepository;
import br.com.emoney.repository.SessionRepository;
import br.com.emoney.service.PasswordService;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@Order(1)
public class ProfessorAuthenticationProvider implements RoleAuthenticationProvider {
    private final ProfessorRepository professorRepository;
    private final PasswordService passwordService;
    private final SessionRepository sessionRepository;

    public ProfessorAuthenticationProvider(ProfessorRepository professorRepository, PasswordService passwordService,
                                           SessionRepository sessionRepository) {
        this.professorRepository = professorRepository;
        this.passwordService = passwordService;
        this.sessionRepository = sessionRepository;
    }

    @Override
    public Optional<AuthResponse> authenticate(LoginRequest request) {
        Optional<Professor> professor = professorRepository.findByEmail(request.getEmail());
        if (professor.isEmpty() || !passwordService.matches(request.getSenha(), professor.get().getSenha())) {
            return Optional.empty();
        }

        Professor authenticated = professor.get();
        if (passwordService.needsRehash(authenticated.getSenha())) {
            authenticated.setSenha(passwordService.encode(request.getSenha()));
            authenticated = professorRepository.save(authenticated);
        }

        AuthSession session = sessionRepository.create(authenticated.getId(), UserRole.PROFESSOR);
        return Optional.of(new AuthResponse(session.getToken(), UserRole.PROFESSOR, new ProfessorResponse(authenticated)));
    }
}

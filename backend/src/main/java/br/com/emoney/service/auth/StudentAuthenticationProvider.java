package br.com.emoney.service.auth;

import br.com.emoney.dto.AuthResponse;
import br.com.emoney.dto.LoginRequest;
import br.com.emoney.dto.StudentResponse;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.SessionRepository;
import br.com.emoney.service.StudentService;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Component
@Order(4)
public class StudentAuthenticationProvider implements RoleAuthenticationProvider {
    private final StudentService studentService;
    private final SessionRepository sessionRepository;

    public StudentAuthenticationProvider(StudentService studentService, SessionRepository sessionRepository) {
        this.studentService = studentService;
        this.sessionRepository = sessionRepository;
    }

    @Override
    public Optional<AuthResponse> authenticate(LoginRequest request) {
        try {
            Student student = studentService.authenticate(request.getEmail(), request.getSenha());
            AuthSession session = sessionRepository.create(student.getId(), UserRole.STUDENT);
            return Optional.of(new AuthResponse(session.getToken(), UserRole.STUDENT, new StudentResponse(student)));
        } catch (ResponseStatusException ignored) {
            return Optional.empty();
        }
    }
}

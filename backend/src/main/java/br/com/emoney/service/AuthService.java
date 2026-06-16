package br.com.emoney.service;

import br.com.emoney.dto.AuthResponse;
import br.com.emoney.dto.CompanyResponse;
import br.com.emoney.dto.LoginRequest;
import br.com.emoney.dto.ProfessorResponse;
import br.com.emoney.dto.RegisterInstitutionRequest;
import br.com.emoney.dto.RegisterCompanyRequest;
import br.com.emoney.dto.RegisterStudentRequest;
import br.com.emoney.dto.StudentResponse;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Company;
import br.com.emoney.model.Institution;
import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.ProfessorRepository;
import br.com.emoney.repository.SessionRepository;
import br.com.emoney.service.auth.RoleAuthenticationProvider;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {
    private final StudentService studentService;
    private final CompanyService companyService;
    private final InstitutionService institutionService;
    private final ProfessorRepository professorRepository;
    private final SessionRepository sessionRepository;
    private final List<RoleAuthenticationProvider> authenticationProviders;

    public AuthService(StudentService studentService, CompanyService companyService,
                       InstitutionService institutionService, ProfessorRepository professorRepository,
                       SessionRepository sessionRepository, List<RoleAuthenticationProvider> authenticationProviders) {
        this.studentService = studentService;
        this.companyService = companyService;
        this.institutionService = institutionService;
        this.professorRepository = professorRepository;
        this.sessionRepository = sessionRepository;
        this.authenticationProviders = authenticationProviders;
    }

    public AuthResponse register(RegisterStudentRequest request) {
        Student student = studentService.create(request);
        AuthSession session = sessionRepository.create(student.getId(), UserRole.STUDENT);
        return new AuthResponse(session.getToken(), UserRole.STUDENT, new StudentResponse(student));
    }

    public AuthResponse registerCompany(RegisterCompanyRequest request) {
        Company company = companyService.create(request);
        AuthSession session = sessionRepository.create(company.getId(), UserRole.COMPANY);
        return new AuthResponse(session.getToken(), UserRole.COMPANY, new CompanyResponse(company));
    }

    public AuthResponse registerInstitution(RegisterInstitutionRequest request) {
        Institution institution = institutionService.create(request);
        AuthSession session = sessionRepository.create(institution.getId(), UserRole.INSTITUTION);
        return new AuthResponse(session.getToken(), UserRole.INSTITUTION, institutionService.findById(institution.getId()));
    }

    public AuthResponse login(LoginRequest request) {
        return authenticationProviders.stream()
                .map(provider -> provider.authenticate(request))
                .flatMap(java.util.Optional::stream)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Email ou senha invalidos."));
    }

    public AuthSession requireSession(String authorization) {
        String token = tokenFromAuthorization(authorization);
        return sessionRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Sessao invalida."));
    }

    public void logout(String authorization) {
        sessionRepository.revoke(tokenFromAuthorization(authorization));
    }

    public AuthResponse me(String authorization) {
        AuthSession session = requireSession(authorization);
        if (session.getRole() == UserRole.PROFESSOR) {
            Professor professor = professorRepository.findById(session.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Professor nao encontrado."));
            return new AuthResponse(session.getToken(), UserRole.PROFESSOR, new ProfessorResponse(professor));
        }

        if (session.getRole() == UserRole.COMPANY) {
            return new AuthResponse(session.getToken(), UserRole.COMPANY, companyService.findById(session.getUserId()));
        }

        if (session.getRole() == UserRole.INSTITUTION) {
            return new AuthResponse(session.getToken(), UserRole.INSTITUTION, institutionService.findById(session.getUserId()));
        }

        return new AuthResponse(session.getToken(), UserRole.STUDENT, studentService.findById(session.getUserId()));
    }

    private String tokenFromAuthorization(String authorization) {
        return authorization == null ? "" : authorization.replace("Bearer ", "");
    }
}

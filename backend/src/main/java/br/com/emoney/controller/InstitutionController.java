package br.com.emoney.controller;

import br.com.emoney.dto.CompanyResponse;
import br.com.emoney.dto.InstitutionResponse;
import br.com.emoney.dto.ProfessorResponse;
import br.com.emoney.dto.RegisterProfessorRequest;
import br.com.emoney.dto.SemesterStartResponse;
import br.com.emoney.dto.StudentResponse;
import br.com.emoney.dto.UpdateInstitutionRequest;
import br.com.emoney.dto.UpdateProfessorRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Professor;
import br.com.emoney.service.AuthService;
import br.com.emoney.service.AuthorizationService;
import br.com.emoney.service.InstitutionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/institutions")
public class InstitutionController {
    private final AuthService authService;
    private final InstitutionService institutionService;
    private final AuthorizationService authorizationService;

    public InstitutionController(AuthService authService, InstitutionService institutionService,
                                 AuthorizationService authorizationService) {
        this.authService = authService;
        this.institutionService = institutionService;
        this.authorizationService = authorizationService;
    }

    @GetMapping("/me")
    public InstitutionResponse me(@RequestHeader("Authorization") String authorization) {
        AuthSession session = requireInstitutionSession(authorization);
        return institutionService.findById(session.getUserId());
    }

    @PutMapping("/me")
    public InstitutionResponse update(@RequestHeader("Authorization") String authorization, @Valid @RequestBody UpdateInstitutionRequest request) {
        AuthSession session = requireInstitutionSession(authorization);
        return institutionService.update(session.getUserId(), request);
    }

    @GetMapping("/me/professors")
    public List<ProfessorResponse> professors(@RequestHeader("Authorization") String authorization) {
        AuthSession session = requireInstitutionSession(authorization);
        return institutionService.listProfessors(session.getUserId());
    }

    @PostMapping("/me/professors")
    public ProfessorResponse createProfessor(@RequestHeader("Authorization") String authorization, @Valid @RequestBody RegisterProfessorRequest request) {
        AuthSession session = requireInstitutionSession(authorization);
        Professor professor = institutionService.createProfessor(session.getUserId(), request, false);
        return new ProfessorResponse(professor);
    }

    @PutMapping("/me/professors/{professorId}")
    public ProfessorResponse updateProfessor(@RequestHeader("Authorization") String authorization, @PathVariable UUID professorId, @Valid @RequestBody UpdateProfessorRequest request) {
        AuthSession session = requireInstitutionSession(authorization);
        return institutionService.updateProfessor(session.getUserId(), professorId, request);
    }

    @DeleteMapping("/me/professors/{professorId}")
    public void deleteProfessor(@RequestHeader("Authorization") String authorization, @PathVariable UUID professorId) {
        AuthSession session = requireInstitutionSession(authorization);
        institutionService.deleteProfessor(session.getUserId(), professorId);
    }

    @GetMapping("/me/students")
    public List<StudentResponse> students(@RequestHeader("Authorization") String authorization) {
        AuthSession session = requireInstitutionSession(authorization);
        return institutionService.listStudents(session.getUserId());
    }

    @GetMapping("/me/companies")
    public List<CompanyResponse> companies(@RequestHeader("Authorization") String authorization) {
        requireInstitutionSession(authorization);
        return institutionService.listCompanies();
    }

    @PostMapping("/me/semester/start")
    public SemesterStartResponse startSemester(@RequestHeader("Authorization") String authorization) {
        AuthSession session = requireInstitutionSession(authorization);
        return institutionService.startSemester(session.getUserId());
    }

    private AuthSession requireInstitutionSession(String authorization) {
        AuthSession session = authService.requireSession(authorization);
        authorizationService.requireInstitution(session);
        return session;
    }
}

package br.com.emoney.service;

import br.com.emoney.dto.ProfessorResponse;
import br.com.emoney.dto.UpdateProfessorRequest;
import br.com.emoney.model.Professor;
import br.com.emoney.repository.InstitutionRepository;
import br.com.emoney.repository.ProfessorRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ProfessorService {
    private final ProfessorRepository professorRepository;
    private final InstitutionRepository institutionRepository;
    private final ValidationService validationService;
    private final BCryptPasswordEncoder passwordEncoder;

    public ProfessorService(ProfessorRepository professorRepository, InstitutionRepository institutionRepository,
                            ValidationService validationService, BCryptPasswordEncoder passwordEncoder) {
        this.professorRepository = professorRepository;
        this.institutionRepository = institutionRepository;
        this.validationService = validationService;
        this.passwordEncoder = passwordEncoder;
    }

    public Professor findEntityById(java.util.UUID professorId) {
        return professorRepository.findById(professorId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Professor nao encontrado."));
    }

    public ProfessorResponse findById(java.util.UUID professorId) {
        Professor professor = findEntityById(professorId);
        ProfessorResponse response = new ProfessorResponse(professor);
        if (professor.getInstitutionId() != null) {
            institutionRepository.findById(professor.getInstitutionId()).ifPresent(institution ->
                    response.setInstitutionName(institution.getNome()));
        }
        return response;
    }

    public ProfessorResponse update(java.util.UUID professorId, UpdateProfessorRequest request) {
        Professor professor = findEntityById(professorId);

        if (request.getNome() != null && !request.getNome().isBlank()) {
            professor.setNome(validationService.text(request.getNome(), "Nome"));
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String email = request.getEmail().toLowerCase();
            professorRepository.findByEmail(email).ifPresent(existing -> {
                if (!existing.getId().equals(professorId)) {
                    throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT, "Ja existe professor com este email.");
                }
            });
            professor.setEmail(email);
        }
        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            professor.setSenha(passwordEncoder.encode(validationService.senha(request.getSenha())));
        }
        if (request.getCursos() != null && !request.getCursos().isEmpty()) {
            professor.setCursos(validationService.cursos(request.getCursos()));
        }
        if (request.getPhotoUrl() != null) {
            professor.setPhotoUrl(request.getPhotoUrl());
        }

        return new ProfessorResponse(professorRepository.save(professor));
    }
}

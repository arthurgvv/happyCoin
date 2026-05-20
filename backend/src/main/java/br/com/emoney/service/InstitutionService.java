package br.com.emoney.service;

import br.com.emoney.dto.CompanyResponse;
import br.com.emoney.dto.InstitutionResponse;
import br.com.emoney.dto.ProfessorResponse;
import br.com.emoney.dto.RegisterInstitutionRequest;
import br.com.emoney.dto.RegisterProfessorRequest;
import br.com.emoney.dto.SemesterStartResponse;
import br.com.emoney.dto.StudentResponse;
import br.com.emoney.dto.UpdateInstitutionRequest;
import br.com.emoney.dto.UpdateProfessorRequest;
import br.com.emoney.model.Institution;
import br.com.emoney.model.Professor;
import br.com.emoney.repository.CompanyRepository;
import br.com.emoney.repository.InstitutionRepository;
import br.com.emoney.repository.ProfessorRepository;
import br.com.emoney.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class InstitutionService {
    private final InstitutionRepository institutionRepository;
    private final ProfessorRepository professorRepository;
    private final ValidationService validationService;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;

    public InstitutionService(InstitutionRepository institutionRepository, ProfessorRepository professorRepository, StudentRepository studentRepository, CompanyRepository companyRepository, ValidationService validationService) {
        this.institutionRepository = institutionRepository;
        this.professorRepository = professorRepository;
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.validationService = validationService;
    }

    public Institution create(RegisterInstitutionRequest request) {
        String email = validationService.text(request.getEmail(), "Email").toLowerCase();
        String identificador = validationService.cnpj(request.getIdentificadorInstitucional());

        if (institutionRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(CONFLICT, "Ja existe instituicao com este email.");
        }

        if (institutionRepository.existsByIdentificadorInstitucional(identificador)) {
            throw new ResponseStatusException(CONFLICT, "Ja existe instituicao com este identificador.");
        }

        Institution institution = new Institution(
                validationService.text(request.getNome(), "Nome da instituicao"),
                email,
                validationService.senha(request.getSenha()),
                validationService.text(request.getTelefone(), "Telefone"),
                validationService.text(request.getEndereco(), "Endereco"),
                identificador
        );

        return institutionRepository.save(institution);
    }

    public Professor createProfessor(UUID institutionId, RegisterProfessorRequest request, boolean withInitialSemesterCredit) {
        Institution institution = findEntityById(institutionId);
        String email = validationService.text(request.getEmail(), "Email").toLowerCase();
        String cpf = validationService.cpf(request.getCpf());

        if (professorRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(CONFLICT, "Ja existe professor com este email.");
        }

        if (professorRepository.existsByCpf(cpf)) {
            throw new ResponseStatusException(CONFLICT, "Ja existe professor com este CPF.");
        }

        Professor professor = new Professor(
                validationService.text(request.getNome(), "Nome"),
                cpf,
                email,
                validationService.senha(request.getSenha()),
                institution.getId(),
                validationService.cursos(request.getCursos()),
                withInitialSemesterCredit ? 1000 : 0
        );

        if (withInitialSemesterCredit) {
            professor.setUltimoAviso("Voce recebeu 1000 moedas de saldo inicial.");
        }

        Professor savedProfessor = professorRepository.save(professor);
        institution.addProfessor(savedProfessor.getId());
        institutionRepository.save(institution);
        return savedProfessor;
    }

    public SemesterStartResponse startSemester(UUID institutionId) {
        Institution institution = findEntityById(institutionId);
        List<Professor> professors = professorRepository.findByInstitutionId(institution.getId());

        professors.forEach(professor -> {
            professor.setSaldoMoedas(professor.getSaldoMoedas() + 1000);
            professor.setUltimoAviso("Novo semestre iniciado: +1000 moedas creditadas.");
            professorRepository.save(professor);
        });

        return new SemesterStartResponse("Semestre iniciado com sucesso.", professors.size());
    }

    public Institution findEntityById(UUID institutionId) {
        return institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Instituicao nao encontrada."));
    }

    public Institution authenticate(String email, String senha) {
        Institution institution = institutionRepository.findByEmail(validationService.text(email, "Email").toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Email ou senha invalidos."));

        if (!institution.getSenha().equals(senha)) {
            throw new ResponseStatusException(NOT_FOUND, "Email ou senha invalidos.");
        }

        return institution;
    }

    public List<ProfessorResponse> listProfessors(UUID institutionId) {
        return professorRepository.findByInstitutionId(institutionId).stream()
                .map(ProfessorResponse::new)
                .toList();
    }

    public InstitutionResponse findById(UUID institutionId) {
        Institution institution = findEntityById(institutionId);
        return new InstitutionResponse(institution, listProfessors(institutionId));
    }

    public InstitutionResponse update(UUID institutionId, UpdateInstitutionRequest request) {
        Institution institution = findEntityById(institutionId);

        if (request.getNome() != null && !request.getNome().isBlank()) {
            institution.setNome(validationService.text(request.getNome(), "Nome da instituicao"));
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String email = request.getEmail().toLowerCase();
            institutionRepository.findByEmail(email).ifPresent(existing -> {
                if (!existing.getId().equals(institutionId)) {
                    throw new ResponseStatusException(CONFLICT, "Ja existe instituicao com este email.");
                }
            });
            institution.setEmail(email);
        }
        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            institution.setSenha(validationService.senha(request.getSenha()));
        }
        if (request.getTelefone() != null && !request.getTelefone().isBlank()) {
            institution.setTelefone(validationService.text(request.getTelefone(), "Telefone"));
        }
        if (request.getEndereco() != null && !request.getEndereco().isBlank()) {
            institution.setEndereco(validationService.text(request.getEndereco(), "Endereco"));
        }
        if (request.getPhotoUrl() != null) {
            institution.setPhotoUrl(request.getPhotoUrl());
        }

        Institution saved = institutionRepository.save(institution);
        return new InstitutionResponse(saved, listProfessors(institutionId));
    }

    public ProfessorResponse updateProfessor(UUID institutionId, UUID professorId, UpdateProfessorRequest request) {
        findEntityById(institutionId);
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Professor nao encontrado."));

        if (!institutionId.equals(professor.getInstitutionId())) {
            throw new ResponseStatusException(FORBIDDEN, "Professor nao pertence a esta instituicao.");
        }

        if (request.getNome() != null && !request.getNome().isBlank()) {
            professor.setNome(validationService.text(request.getNome(), "Nome"));
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String email = request.getEmail().toLowerCase();
            professorRepository.findByEmail(email).ifPresent(existing -> {
                if (!existing.getId().equals(professorId)) {
                    throw new ResponseStatusException(CONFLICT, "Ja existe professor com este email.");
                }
            });
            professor.setEmail(email);
        }
        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            professor.setSenha(validationService.senha(request.getSenha()));
        }
        if (request.getCursos() != null && !request.getCursos().isEmpty()) {
            professor.setCursos(validationService.cursos(request.getCursos()));
        }
        if (request.getPhotoUrl() != null) {
            professor.setPhotoUrl(request.getPhotoUrl());
        }

        return new ProfessorResponse(professorRepository.save(professor));
    }

    public void deleteProfessor(UUID institutionId, UUID professorId) {
        Institution institution = findEntityById(institutionId);
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Professor nao encontrado."));

        if (!institutionId.equals(professor.getInstitutionId())) {
            throw new ResponseStatusException(FORBIDDEN, "Professor nao pertence a esta instituicao.");
        }

        professorRepository.delete(professor);
        institution.getProfessores().remove(professorId);
        institutionRepository.save(institution);
    }

    public List<StudentResponse> listStudents(UUID institutionId) {
        findEntityById(institutionId);
        return studentRepository.findByInstitutionId(institutionId).stream()
                .map(StudentResponse::new)
                .toList();
    }

    public List<String> listInstitutionNames() {
        return institutionRepository.findAll().stream()
                .map(Institution::getNome)
                .sorted()
                .toList();
    }

    public List<CompanyResponse> listCompanies() {
        return companyRepository.findAll().stream()
                .map(CompanyResponse::new)
                .toList();
    }
}

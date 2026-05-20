package br.com.emoney.controller;

import br.com.emoney.dto.CoinTransferResponse;
import br.com.emoney.dto.ProfessorResponse;
import br.com.emoney.dto.StudentResponse;
import br.com.emoney.dto.TransferCoinsRequest;
import br.com.emoney.dto.UpdateProfessorRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Professor;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.InstitutionRepository;
import br.com.emoney.repository.StudentRepository;
import br.com.emoney.repository.TransferRepository;
import br.com.emoney.service.AuthService;
import br.com.emoney.service.ProfessorService;
import br.com.emoney.service.StudentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;

@RestController
@RequestMapping("/api/professors")
public class ProfessorController {
    private final AuthService authService;
    private final ProfessorService professorService;
    private final StudentService studentService;
    private final TransferRepository transferRepository;
    private final StudentRepository studentRepository;
    private final InstitutionRepository institutionRepository;

    public ProfessorController(AuthService authService, ProfessorService professorService, StudentService studentService, TransferRepository transferRepository, StudentRepository studentRepository, InstitutionRepository institutionRepository) {
        this.authService = authService;
        this.professorService = professorService;
        this.studentService = studentService;
        this.transferRepository = transferRepository;
        this.studentRepository = studentRepository;
        this.institutionRepository = institutionRepository;
    }

    @PostMapping("/transfer")
    public ProfessorResponse transfer(@RequestHeader("Authorization") String authorization, @RequestBody TransferCoinsRequest request) {
        AuthSession session = authService.requireSession(authorization);
        return professorService.transfer(session, request);
    }

    @GetMapping("/me/courses")
    public java.util.List<String> courses(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        Professor professor = professorService.findEntityById(session.getUserId());
        return professor.getCursos().stream().distinct().toList();
    }

    @GetMapping("/me/courses/{course}/students")
    public java.util.List<StudentResponse> studentsByCourse(@RequestHeader("Authorization") String authorization, @PathVariable String course) {
        AuthSession session = authService.requireSession(authorization);
        Professor professor = professorService.findEntityById(session.getUserId());
        if (!professor.getCursos().contains(course)) {
            throw new ResponseStatusException(BAD_REQUEST, "Professor so pode acessar alunos dos cursos atribuidos.");
        }
        return studentService.listByInstitutionAndCourse(professor.getInstitutionId(), course);
    }

    @GetMapping("/me")
    public ProfessorResponse me(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem acessar esta area.");
        }
        Professor professor = professorService.findEntityById(session.getUserId());
        ProfessorResponse response = new ProfessorResponse(professor);
        if (professor.getInstitutionId() != null) {
            institutionRepository.findById(professor.getInstitutionId()).ifPresent(inst ->
                    response.setInstitutionName(inst.getNome()));
        }
        return response;
    }

    @PutMapping("/me")
    public ProfessorResponse update(@RequestHeader("Authorization") String authorization, @RequestBody UpdateProfessorRequest request) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem acessar esta area.");
        }
        return professorService.update(session.getUserId(), request);
    }

    @GetMapping("/me/transfers")
    public java.util.List<CoinTransferResponse> transfers(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem acessar esta area.");
        }
        return transferRepository.findByProfessorIdOrderByCriadoEmDesc(session.getUserId())
                .stream()
                .map(t -> {
                    CoinTransferResponse r = new CoinTransferResponse(t);
                    studentRepository.findById(t.getStudentId()).ifPresent(s ->
                            r.withStudentInfo(s.getNome(), s.getEmail(), s.getCurso(), s.getPhotoUrl()));
                    return r;
                })
                .toList();
    }
}

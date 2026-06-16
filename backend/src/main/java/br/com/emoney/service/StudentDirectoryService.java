package br.com.emoney.service;

import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.ProfessorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class StudentDirectoryService {
    private final StudentService studentService;
    private final ProfessorRepository professorRepository;
    private final AuthorizationService authorizationService;

    public StudentDirectoryService(StudentService studentService, ProfessorRepository professorRepository,
                                   AuthorizationService authorizationService) {
        this.studentService = studentService;
        this.professorRepository = professorRepository;
        this.authorizationService = authorizationService;
    }

    public List<Map<String, String>> professorsForStudent(AuthSession session) {
        authorizationService.requireRole(session, UserRole.STUDENT, "Apenas alunos podem acessar esta area.");

        Student student = studentService.findEntityById(session.getUserId());
        if (student.getInstitutionId() == null) {
            return List.of();
        }

        return professorRepository.findByInstitutionId(student.getInstitutionId()).stream()
                .filter(professor -> authorizationService.canStudentInteractWithProfessor(student, professor))
                .map(professor -> Map.of(
                        "id", professor.getId().toString(),
                        "nome", professor.getNome(),
                        "email", professor.getEmail()
                ))
                .toList();
    }
}

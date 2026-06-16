package br.com.emoney.service;

import br.com.emoney.dto.StudentResponse;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Professor;
import br.com.emoney.model.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class ProfessorDirectoryService {
    private final ProfessorService professorService;
    private final StudentService studentService;
    private final AuthorizationService authorizationService;

    public ProfessorDirectoryService(ProfessorService professorService, StudentService studentService,
                                     AuthorizationService authorizationService) {
        this.professorService = professorService;
        this.studentService = studentService;
        this.authorizationService = authorizationService;
    }

    public List<String> courses(AuthSession session) {
        authorizationService.requireRole(session, UserRole.PROFESSOR, "Apenas professores podem acessar esta area.");
        Professor professor = professorService.findEntityById(session.getUserId());
        return professor.getCursos().stream().distinct().toList();
    }

    public List<StudentResponse> studentsByCourse(AuthSession session, String course) {
        authorizationService.requireRole(session, UserRole.PROFESSOR, "Apenas professores podem acessar esta area.");
        Professor professor = professorService.findEntityById(session.getUserId());
        if (!professor.getCursos().contains(course)) {
            throw new ResponseStatusException(BAD_REQUEST, "Professor so pode acessar alunos dos cursos atribuidos.");
        }
        return studentService.listByInstitutionAndCourse(professor.getInstitutionId(), course);
    }
}

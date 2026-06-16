package br.com.emoney.service;

import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;

@Service
public class AuthorizationService {

    public void requireRole(AuthSession session, UserRole role, String message) {
        if (session.getRole() != role) {
            throw new ResponseStatusException(FORBIDDEN, message);
        }
    }

    public void requireStudent(AuthSession session) {
        requireRole(session, UserRole.STUDENT, "Apenas alunos podem acessar esta area.");
    }

    public void requireProfessor(AuthSession session) {
        requireRole(session, UserRole.PROFESSOR, "Apenas professores podem acessar esta area.");
    }

    public void requireCompany(AuthSession session) {
        requireRole(session, UserRole.COMPANY, "Apenas empresas podem acessar esta area.");
    }

    public void requireInstitution(AuthSession session) {
        requireRole(session, UserRole.INSTITUTION, "Apenas instituicoes podem acessar esta area.");
    }

    public void requireProfessorCanInteractWithStudent(Professor professor, Student student, String message) {
        if (!canProfessorInteractWithStudent(professor, student)) {
            throw new ResponseStatusException(BAD_REQUEST, message);
        }
    }

    public void requireStudentCanInteractWithProfessor(Student student, Professor professor, String message) {
        if (!canStudentInteractWithProfessor(student, professor)) {
            throw new ResponseStatusException(BAD_REQUEST, message);
        }
    }

    public boolean canProfessorInteractWithStudent(Professor professor, Student student) {
        return professor.getInstitutionId() != null
                && student.getInstitutionId() != null
                && professor.getInstitutionId().equals(student.getInstitutionId())
                && professor.getCursos() != null
                && professor.getCursos().contains(student.getCurso());
    }

    public boolean canStudentInteractWithProfessor(Student student, Professor professor) {
        return student.getInstitutionId() != null
                && professor.getInstitutionId() != null
                && student.getInstitutionId().equals(professor.getInstitutionId())
                && professor.getCursos() != null
                && professor.getCursos().stream().anyMatch(course -> sameCourse(course, student.getCurso()));
    }

    private boolean sameCourse(String professorCourse, String studentCourse) {
        return professorCourse != null
                && studentCourse != null
                && professorCourse.trim().equalsIgnoreCase(studentCourse.trim());
    }
}

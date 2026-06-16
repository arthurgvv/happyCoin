package br.com.emoney.service;

import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Institution;
import br.com.emoney.model.Professor;
import br.com.emoney.model.UserRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfessorDirectoryServiceTest {

    @Mock
    private ProfessorService professorService;

    @Mock
    private StudentService studentService;

    @Test
    void returnsDistinctProfessorCourses() {
        ProfessorDirectoryService service = service();
        Institution institution = institution();
        Professor professor = new Professor(
                "Ana",
                "52998224725",
                "ana@gmail.com",
                "senha",
                institution.getId(),
                List.of("Engenharia de Software", "Engenharia de Software", "Direito"),
                100
        );
        when(professorService.findEntityById(professor.getId())).thenReturn(professor);

        var courses = service.courses(new AuthSession("token", professor.getId(), UserRole.PROFESSOR));

        assertThat(courses).containsExactly("Engenharia de Software", "Direito");
    }

    @Test
    void rejectsStudentsByCourseWhenCourseIsNotAssignedToProfessor() {
        ProfessorDirectoryService service = service();
        Institution institution = institution();
        Professor professor = new Professor(
                "Ana",
                "52998224725",
                "ana@gmail.com",
                "senha",
                institution.getId(),
                List.of("Engenharia de Software"),
                100
        );
        when(professorService.findEntityById(professor.getId())).thenReturn(professor);

        assertThatThrownBy(() -> service.studentsByCourse(new AuthSession("token", professor.getId(), UserRole.PROFESSOR), "Direito"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("cursos atribuidos");
    }

    private ProfessorDirectoryService service() {
        return new ProfessorDirectoryService(professorService, studentService, new AuthorizationService());
    }

    private Institution institution() {
        return new Institution("PUC Minas", "contato@pucminas.edu", "senha123", "3133334444", "Rua A", "11222333000181");
    }
}

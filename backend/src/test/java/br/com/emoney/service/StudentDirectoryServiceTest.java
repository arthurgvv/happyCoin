package br.com.emoney.service;

import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Institution;
import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.ProfessorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentDirectoryServiceTest {

    @Mock
    private StudentService studentService;

    @Mock
    private ProfessorRepository professorRepository;

    @Test
    void listsOnlyProfessorsFromStudentCourse() {
        StudentDirectoryService service = new StudentDirectoryService(studentService, professorRepository, new AuthorizationService());
        Institution institution = new Institution("PUC Minas", "contato@pucminas.edu", "senha123", "3133334444", "Rua A", "11222333000181");
        Student student = new Student("Bruno", "bruno@gmail.com", "11122233344", "123456789", "Rua A", institution.getNome(), "Engenharia de Software", "senha");
        student.setInstitutionId(institution.getId());
        Professor matching = new Professor("Ana", "52998224725", "ana@gmail.com", "senha", institution.getId(), List.of("Engenharia de Software"), 100);
        Professor otherCourse = new Professor("Carlos", "39053344705", "carlos@gmail.com", "senha", institution.getId(), List.of("Direito"), 100);

        when(studentService.findEntityById(student.getId())).thenReturn(student);
        when(professorRepository.findByInstitutionId(institution.getId())).thenReturn(List.of(matching, otherCourse));

        var response = service.professorsForStudent(new AuthSession("token", student.getId(), UserRole.STUDENT));

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().get("email")).isEqualTo("ana@gmail.com");
    }
}

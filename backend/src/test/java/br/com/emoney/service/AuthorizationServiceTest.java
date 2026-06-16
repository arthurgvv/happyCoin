package br.com.emoney.service;

import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthorizationServiceTest {

    @Test
    void requiresExpectedRole() {
        AuthorizationService service = new AuthorizationService();

        service.requireStudent(new AuthSession("token", UUID.randomUUID(), UserRole.STUDENT));

        assertThatThrownBy(() -> service.requireStudent(new AuthSession("token", UUID.randomUUID(), UserRole.PROFESSOR)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Apenas alunos");
    }

    @Test
    void allowsProfessorToInteractOnlyWithStudentFromSameInstitutionAndCourse() {
        AuthorizationService service = new AuthorizationService();
        UUID institutionId = UUID.randomUUID();
        Professor professor = new Professor(
                "Ana",
                "12345678901",
                "ana@gmail.com",
                "senha",
                institutionId,
                List.of("Engenharia"),
                100
        );
        Student student = new Student("Bruno", "bruno@gmail.com", "11122233344", "123456789", "Rua A", "PUC", "Engenharia", "senha");
        student.setInstitutionId(institutionId);

        assertThat(service.canProfessorInteractWithStudent(professor, student)).isTrue();

        student.setCurso("Direito");

        assertThat(service.canProfessorInteractWithStudent(professor, student)).isFalse();
    }
}

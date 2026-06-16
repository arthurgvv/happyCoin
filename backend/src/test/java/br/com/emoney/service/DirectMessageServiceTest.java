package br.com.emoney.service;

import br.com.emoney.dto.SendEmailRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Institution;
import br.com.emoney.model.Message;
import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.MessageRepository;
import br.com.emoney.repository.ProfessorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DirectMessageServiceTest {

    @Mock
    private ProfessorService professorService;

    @Mock
    private StudentService studentService;

    @Mock
    private ProfessorRepository professorRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private EmailService emailService;

    @Test
    void professorSendsDirectMessageToStudentFromSameCourse() {
        DirectMessageService service = service();
        Institution institution = institution();
        Professor professor = professor(institution, List.of("Engenharia de Software"));
        Student student = student(institution, "Engenharia de Software");
        SendEmailRequest request = request(student.getId());

        when(professorService.findEntityById(professor.getId())).thenReturn(professor);
        when(studentService.findEntityById(student.getId())).thenReturn(student);

        service.sendFromProfessor(new AuthSession("token", professor.getId(), UserRole.PROFESSOR), request);

        verify(messageRepository).save(any(Message.class));
        verify(emailService).sendDirectMessage(professor, student, "Assunto", "Corpo");
    }

    @Test
    void studentCannotSendDirectMessageToProfessorFromDifferentCourse() {
        DirectMessageService service = service();
        Institution institution = institution();
        Student student = student(institution, "Direito");
        Professor professor = professor(institution, List.of("Engenharia de Software"));
        SendEmailRequest request = request(professor.getId());

        when(studentService.findEntityById(student.getId())).thenReturn(student);
        when(professorRepository.findById(professor.getId())).thenReturn(Optional.of(professor));

        assertThatThrownBy(() -> service.sendFromStudent(new AuthSession("token", student.getId(), UserRole.STUDENT), request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Aluno so pode enviar emails");
        verify(messageRepository, never()).save(any(Message.class));
        verify(emailService, never()).sendDirectMessage(any(Student.class), any(Professor.class), any(), any());
    }

    private DirectMessageService service() {
        return new DirectMessageService(
                professorService,
                studentService,
                professorRepository,
                messageRepository,
                emailService,
                new AuthorizationService()
        );
    }

    private Institution institution() {
        return new Institution("PUC Minas", "contato@pucminas.edu", "senha123", "3133334444", "Rua A", "11222333000181");
    }

    private Professor professor(Institution institution, List<String> cursos) {
        return new Professor("Ana", "52998224725", "ana@gmail.com", "senha", institution.getId(), cursos, 100);
    }

    private Student student(Institution institution, String curso) {
        Student student = new Student("Bruno", "bruno@gmail.com", "11122233344", "123456789", "Rua A", institution.getNome(), curso, "senha");
        student.setInstitutionId(institution.getId());
        return student;
    }

    private SendEmailRequest request(java.util.UUID recipientId) {
        SendEmailRequest request = new SendEmailRequest();
        request.setStudentId(recipientId);
        request.setSubject("Assunto");
        request.setBody("Corpo");
        return request;
    }
}

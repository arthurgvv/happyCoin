package br.com.emoney.service;

import br.com.emoney.dto.TransferCoinsRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.Institution;
import br.com.emoney.model.Message;
import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.InstitutionRepository;
import br.com.emoney.repository.MessageRepository;
import br.com.emoney.repository.ProfessorRepository;
import br.com.emoney.repository.StudentRepository;
import br.com.emoney.repository.TransferRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.argThat;

@ExtendWith(MockitoExtension.class)
class CoinTransferServiceTest {

    @Mock
    private ProfessorRepository professorRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TransferRepository transferRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private EmailService emailService;

    @Test
    void rejectsTransferWhenStudentIsOutsideProfessorCourses() throws Exception {
        ValidationService validationService = new ValidationService();
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        PasswordService passwordService = new PasswordService(passwordEncoder);
        StudentService studentService = new StudentService(studentRepository, validationService, institutionRepository, passwordService);
        CoinTransferService coinTransferService = new CoinTransferService(professorRepository, studentService, transferRepository, messageRepository, validationService, emailService, new AuthorizationService());

        Institution institution = new Institution(
                "PUC Minas",
                "contato@pucminas.edu",
                "senha123",
                "3133334444",
                "Av. Dom Jose Gaspar",
                "12345678000199"
        );

        Professor professor = new Professor(
                "Ana Souza",
                "12345678901",
                "ana@gmail.com",
                "senha123",
                institution.getId(),
                List.of("Engenharia de Software"),
                1000
        );

        Student student = new Student(
                "Bruno Lima",
                "bruno@gmail.com",
                "11122233344",
                "123456789",
                "Rua A",
                institution.getNome(),
                "Direito",
                "senha123"
        );
        student.setInstitutionId(institution.getId());

        when(professorRepository.findById(professor.getId())).thenReturn(Optional.of(professor));
        when(studentRepository.findById(student.getId())).thenReturn(Optional.of(student));

        TransferCoinsRequest request = new TransferCoinsRequest();
        setField(request, "studentId", student.getId());
        setField(request, "quantidade", 50);
        setField(request, "motivo", "Participacao");

        AuthSession session = new AuthSession("token", professor.getId(), UserRole.PROFESSOR);

        assertThatThrownBy(() -> coinTransferService.transfer(session, request))
                .hasMessageContaining("cursos atribuidos");
        verify(messageRepository, never()).save(any(Message.class));
        verify(emailService, never()).sendCoinTransferConfirmation(professor, student, 50, "Participacao");
        verify(emailService, never()).sendCoinReceivedNotification(professor, student, 50, "Participacao");
    }

    @Test
    void sendsEmailsWhenTransferSucceeds() throws Exception {
        ValidationService validationService = new ValidationService();
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        PasswordService passwordService = new PasswordService(passwordEncoder);
        StudentService studentService = new StudentService(studentRepository, validationService, institutionRepository, passwordService);
        CoinTransferService coinTransferService = new CoinTransferService(professorRepository, studentService, transferRepository, messageRepository, validationService, emailService, new AuthorizationService());

        Institution institution = new Institution(
                "PUC Minas",
                "contato@pucminas.edu",
                "senha123",
                "3133334444",
                "Av. Dom Jose Gaspar",
                "12345678000199"
        );

        Professor professor = new Professor(
                "Ana Souza",
                "12345678901",
                "ana@gmail.com",
                "senha123",
                institution.getId(),
                List.of("Engenharia de Software"),
                1000
        );

        Student student = new Student(
                "Bruno Lima",
                "bruno@gmail.com",
                "11122233344",
                "123456789",
                "Rua A",
                institution.getNome(),
                "Engenharia de Software",
                "senha123"
        );
        student.setInstitutionId(institution.getId());

        when(professorRepository.findById(professor.getId())).thenReturn(Optional.of(professor));
        when(studentRepository.findById(student.getId())).thenReturn(Optional.of(student));

        TransferCoinsRequest request = new TransferCoinsRequest();
        setField(request, "studentId", student.getId());
        setField(request, "quantidade", 50);
        setField(request, "motivo", "Participacao");

        AuthSession session = new AuthSession("token", professor.getId(), UserRole.PROFESSOR);

        coinTransferService.transfer(session, request);

        verify(professorRepository).save(professor);
        verify(studentRepository).save(student);
        verify(transferRepository).save(any());
        verify(messageRepository).save(argThat(message ->
                message.getFromId().equals(professor.getId())
                        && message.getFromRole() == UserRole.PROFESSOR
                        && message.getToId().equals(student.getId())
                        && message.getToRole() == UserRole.STUDENT
                        && "COIN_TRANSFER".equals(message.getType())
        ));
        verify(emailService).sendCoinTransferConfirmation(professor, student, 50, "Participacao");
        verify(emailService).sendCoinReceivedNotification(professor, student, 50, "Participacao");
    }

    @Test
    void rejectsTransferWhenProfessorHasInsufficientBalance() throws Exception {
        ValidationService validationService = new ValidationService();
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        PasswordService passwordService = new PasswordService(passwordEncoder);
        StudentService studentService = new StudentService(studentRepository, validationService, institutionRepository, passwordService);
        CoinTransferService coinTransferService = new CoinTransferService(professorRepository, studentService, transferRepository, messageRepository, validationService, emailService, new AuthorizationService());

        Institution institution = new Institution(
                "PUC Minas",
                "contato@pucminas.edu",
                "senha123",
                "3133334444",
                "Av. Dom Jose Gaspar",
                "12345678000199"
        );

        Professor professor = new Professor(
                "Ana Souza",
                "12345678901",
                "ana@gmail.com",
                "senha123",
                institution.getId(),
                List.of("Engenharia de Software"),
                10
        );

        when(professorRepository.findById(professor.getId())).thenReturn(Optional.of(professor));

        TransferCoinsRequest request = new TransferCoinsRequest();
        setField(request, "studentId", java.util.UUID.randomUUID());
        setField(request, "quantidade", 50);
        setField(request, "motivo", "Participacao");

        AuthSession session = new AuthSession("token", professor.getId(), UserRole.PROFESSOR);

        assertThatThrownBy(() -> coinTransferService.transfer(session, request))
                .hasMessageContaining("saldo suficiente");
        verify(professorRepository, never()).save(any(Professor.class));
        verify(studentRepository, never()).save(any(Student.class));
        verify(transferRepository, never()).save(any());
        verify(messageRepository, never()).save(any(Message.class));
        verify(emailService, never()).sendCoinTransferConfirmation(any(), any(), any(Integer.class), any());
        verify(emailService, never()).sendCoinReceivedNotification(any(), any(), any(Integer.class), any());
    }

    private static void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}

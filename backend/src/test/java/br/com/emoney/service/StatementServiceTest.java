package br.com.emoney.service;

import br.com.emoney.model.AuthSession;
import br.com.emoney.model.CoinTransfer;
import br.com.emoney.model.Company;
import br.com.emoney.model.Product;
import br.com.emoney.model.ProductPurchase;
import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.CompanyRepository;
import br.com.emoney.repository.ProductPurchaseRepository;
import br.com.emoney.repository.ProductRepository;
import br.com.emoney.repository.ProfessorRepository;
import br.com.emoney.repository.StudentRepository;
import br.com.emoney.repository.TransferRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatementServiceTest {

    @Mock
    private TransferRepository transferRepository;

    @Mock
    private ProductPurchaseRepository purchaseRepository;

    @Mock
    private ProfessorRepository professorRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private ProductRepository productRepository;

    @Test
    void enrichesStudentTransfersWithProfessorInfo() {
        StatementService service = service();
        UUID studentId = UUID.randomUUID();
        Professor professor = new Professor("Ana", "12345678901", "ana@gmail.com", "senha", UUID.randomUUID(), List.of("Engenharia"), 100);
        CoinTransfer transfer = new CoinTransfer(professor.getId(), studentId, 20, "Participacao");

        when(transferRepository.findByStudentIdOrderByCriadoEmDesc(studentId)).thenReturn(List.of(transfer));
        when(professorRepository.findById(professor.getId())).thenReturn(Optional.of(professor));

        var response = service.transfersForStudent(new AuthSession("token", studentId, UserRole.STUDENT));

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().getProfessorName()).isEqualTo("Ana");
    }

    @Test
    void enrichesStudentPurchasesWithCompanyAndProductInfo() {
        StatementService service = service();
        UUID studentId = UUID.randomUUID();
        Company company = new Company("Empresa", "12345678000199", "empresa@gmail.com", "senha");
        Product product = new Product("Curso", "Empresa", "Descricao", 100, "/curso.svg", company.getId());
        ProductPurchase purchase = new ProductPurchase(product.getId(), company.getId(), studentId, "Curso", "Bruno", "bruno@gmail.com", 100);

        when(purchaseRepository.findByStudentIdOrderByCriadoEmDesc(studentId)).thenReturn(List.of(purchase));
        when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));

        var response = service.purchasesForStudent(new AuthSession("token", studentId, UserRole.STUDENT));

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().getCompanyName()).isEqualTo("Empresa");
        assertThat(response.getFirst().getProductImageUrl()).isEqualTo("/curso.svg");
    }

    @Test
    void enrichesProfessorTransfersWithStudentInfo() {
        StatementService service = service();
        UUID professorId = UUID.randomUUID();
        Student student = new Student("Bruno", "bruno@gmail.com", "11122233344", "123456789", "Rua A", "PUC", "Engenharia", "senha");
        CoinTransfer transfer = new CoinTransfer(professorId, student.getId(), 20, "Participacao");

        when(transferRepository.findByProfessorIdOrderByCriadoEmDesc(professorId)).thenReturn(List.of(transfer));
        when(studentRepository.findById(student.getId())).thenReturn(Optional.of(student));

        var response = service.transfersForProfessor(new AuthSession("token", professorId, UserRole.PROFESSOR));

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().getStudentName()).isEqualTo("Bruno");
        assertThat(response.getFirst().getStudentCourse()).isEqualTo("Engenharia");
    }

    @Test
    void rejectsStudentStatementForNonStudentSession() {
        StatementService service = service();

        assertThatThrownBy(() -> service.purchasesForStudent(new AuthSession("token", UUID.randomUUID(), UserRole.PROFESSOR)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Apenas alunos");
    }

    private StatementService service() {
        return new StatementService(
                transferRepository,
                purchaseRepository,
                professorRepository,
                studentRepository,
                companyRepository,
                productRepository,
                new AuthorizationService()
        );
    }
}

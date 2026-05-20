package br.com.emoney.service;

import br.com.emoney.dto.RegisterInstitutionRequest;
import br.com.emoney.dto.SemesterStartResponse;
import br.com.emoney.model.Institution;
import br.com.emoney.repository.CompanyRepository;
import br.com.emoney.repository.InstitutionRepository;
import br.com.emoney.repository.ProfessorRepository;
import br.com.emoney.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InstitutionServiceTest {

    @Mock
    private ProfessorRepository professorRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Test
    void registersInstitutionWithoutCreatingProfessorsFromRequest() {
        ValidationService validationService = new ValidationService();
        InstitutionService institutionService = new InstitutionService(institutionRepository, professorRepository, studentRepository, companyRepository, validationService);

        when(institutionRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(institutionRepository.existsByIdentificadorInstitucional(anyString())).thenReturn(false);
        when(institutionRepository.save(any(Institution.class))).thenAnswer(inv -> inv.getArgument(0));

        RegisterInstitutionRequest request = new RegisterInstitutionRequest();
        request.setNome("PUC Minas Coreu");
        request.setEmail("contato@pucminascoreu.edu");
        request.setSenha("senha123");
        request.setTelefone("3133334444");
        request.setEndereco("Av. Dom Jose Gaspar");
        request.setIdentificadorInstitucional("12345678000199");

        Institution institution = institutionService.create(request);

        when(institutionRepository.findById(institution.getId())).thenReturn(Optional.of(institution));
        when(professorRepository.findByInstitutionId(institution.getId())).thenReturn(List.of());

        SemesterStartResponse semester = institutionService.startSemester(institution.getId());

        assertThat(institution.getId()).isNotNull();
        assertThat(institution.getProfessores()).isEmpty();
        assertThat(semester.getProfessoresAtualizados()).isZero();
    }
}

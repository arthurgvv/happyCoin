package br.com.emoney.service;

import br.com.emoney.dto.RegisterStudentRequest;
import br.com.emoney.dto.StudentResponse;
import br.com.emoney.dto.UpdateStudentRequest;
import br.com.emoney.model.Institution;
import br.com.emoney.model.Student;
import br.com.emoney.repository.InstitutionRepository;
import br.com.emoney.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class StudentService {
    private final StudentRepository studentRepository;
    private final ValidationService validationService;
    private final InstitutionRepository institutionRepository;
    private final PasswordService passwordService;
    private final EmailService emailService;

    public StudentService(StudentRepository studentRepository, ValidationService validationService,
                          InstitutionRepository institutionRepository, PasswordService passwordService,
                          EmailService emailService) {
        this.studentRepository = studentRepository;
        this.validationService = validationService;
        this.institutionRepository = institutionRepository;
        this.passwordService = passwordService;
        this.emailService = emailService;
    }

    public List<StudentResponse> list() {
        return studentRepository.findAll().stream().map(StudentResponse::new).toList();
    }

    public Student findEntityById(UUID id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Aluno nao encontrado."));
    }

    public StudentResponse findById(UUID id) {
        return new StudentResponse(findEntityById(id));
    }

    public Student create(RegisterStudentRequest request) {
        String email = validationService.text(request.getEmail(), "Email").toLowerCase();
        String cpf = validationService.cpf(request.getCpf());
        String rg = validationService.rg(request.getRg());
        Institution institution = findInstitutionByName(request.getInstituicao());

        if (studentRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(CONFLICT, "Ja existe aluno com este email.");
        }

        if (studentRepository.existsByCpf(cpf)) {
            throw new ResponseStatusException(CONFLICT, "Ja existe aluno com este CPF.");
        }

        String rawPassword = validationService.senha(request.getSenha());
        Student student = new Student(
                validationService.text(request.getNome(), "Nome"),
                email,
                cpf,
                rg,
                validationService.text(request.getEndereco(), "Endereco"),
                institution.getNome(),
                validationService.curso(request.getCurso()),
                passwordService.encode(rawPassword)
        );
        student.setInstitutionId(institution.getId());

        Student saved = studentRepository.save(student);
        emailService.sendWelcomeStudent(saved, rawPassword);
        return saved;
    }

    public Student authenticate(String email, String senha) {
        Student student = studentRepository.findByEmail(validationService.text(email, "Email").toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Email ou senha invalidos."));

        if (!passwordService.matches(senha, student.getSenha())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Email ou senha invalidos.");
        }

        if (passwordService.needsRehash(student.getSenha())) {
            student.setSenha(passwordService.encode(senha));
            return studentRepository.save(student);
        }

        return student;
    }

    public StudentResponse update(UUID id, UpdateStudentRequest request) {
        Student student = findEntityById(id);
        student.setNome(validationService.text(request.getNome(), "Nome"));
        student.setEmail(validationService.text(request.getEmail(), "Email").toLowerCase());
        String requestedCpf = onlyDigits(request.getCpf());
        if (!requestedCpf.equals(student.getCpf())) {
            student.setCpf(validationService.cpf(request.getCpf()));
        }
        student.setRg(validationService.rg(request.getRg()));
        student.setEndereco(validationService.text(request.getEndereco(), "Endereco"));
        Institution institution = findInstitutionByName(request.getInstituicao());
        student.setInstituicao(institution.getNome());
        student.setInstitutionId(institution.getId());
        student.setCurso(validationService.curso(request.getCurso()));

        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            student.setSenha(passwordService.encode(validationService.senha(request.getSenha())));
        }
        if (request.getPhotoUrl() != null) {
            student.setPhotoUrl(request.getPhotoUrl());
        }

        return new StudentResponse(studentRepository.save(student));
    }

    public Student save(Student student) {
        return studentRepository.save(student);
    }

    public List<StudentResponse> listByInstitutionAndCourse(UUID institutionId, String course) {
        return studentRepository.findByInstitutionIdAndCurso(institutionId, validationService.curso(course)).stream()
                .map(StudentResponse::new)
                .toList();
    }

    private Institution findInstitutionByName(String institutionName) {
        String normalizedName = validationService.instituicao(institutionName);
        return institutionRepository.findByNomeIgnoreCase(normalizedName)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Instituicao de ensino nao cadastrada."));
    }

    private String onlyDigits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }
}

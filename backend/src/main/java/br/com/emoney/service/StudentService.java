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

    public StudentService(StudentRepository studentRepository, ValidationService validationService,
                          InstitutionRepository institutionRepository, PasswordService passwordService) {
        this.studentRepository = studentRepository;
        this.validationService = validationService;
        this.institutionRepository = institutionRepository;
        this.passwordService = passwordService;
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
                resolveInstitutionName(request.getInstituicao()),
                validationService.curso(request.getCurso()),
                passwordService.encode(rawPassword)
        );
        student.setInstitutionId(resolveInstitutionId(request.getInstituicao()));

        return studentRepository.save(student);
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
        student.setCpf(validationService.cpf(request.getCpf()));
        student.setRg(validationService.rg(request.getRg()));
        student.setEndereco(validationService.text(request.getEndereco(), "Endereco"));
        student.setInstituicao(resolveInstitutionName(request.getInstituicao()));
        student.setInstitutionId(resolveInstitutionId(request.getInstituicao()));
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

    private UUID resolveInstitutionId(String institutionName) {
        return findInstitutionByName(institutionName).getId();
    }

    private String resolveInstitutionName(String institutionName) {
        return findInstitutionByName(institutionName).getNome();
    }

    private Institution findInstitutionByName(String institutionName) {
        String normalizedName = validationService.instituicao(institutionName);
        return institutionRepository.findAll().stream()
                .filter(institution -> institution.getNome().equalsIgnoreCase(normalizedName))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Instituicao de ensino nao cadastrada."));
    }
}

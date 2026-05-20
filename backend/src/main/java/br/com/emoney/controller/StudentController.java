package br.com.emoney.controller;

import br.com.emoney.dto.CoinTransferResponse;
import br.com.emoney.dto.ProductPurchaseResponse;
import br.com.emoney.dto.StudentResponse;
import br.com.emoney.dto.UpdateStudentRequest;
import br.com.emoney.model.AuthSession;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.ProfessorRepository;
import br.com.emoney.repository.ProductPurchaseRepository;
import br.com.emoney.repository.TransferRepository;
import br.com.emoney.service.AuthService;
import br.com.emoney.service.InstitutionService;
import br.com.emoney.service.StudentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.FORBIDDEN;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentService studentService;
    private final AuthService authService;
    private final InstitutionService institutionService;
    private final TransferRepository transferRepository;
    private final ProductPurchaseRepository purchaseRepository;
    private final ProfessorRepository professorRepository;

    public StudentController(StudentService studentService, AuthService authService, InstitutionService institutionService, TransferRepository transferRepository, ProductPurchaseRepository purchaseRepository, ProfessorRepository professorRepository) {
        this.studentService = studentService;
        this.authService = authService;
        this.institutionService = institutionService;
        this.transferRepository = transferRepository;
        this.purchaseRepository = purchaseRepository;
        this.professorRepository = professorRepository;
    }

    @GetMapping
    public List<StudentResponse> list() {
        return studentService.list();
    }

    @GetMapping("/me")
    public StudentResponse me(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas alunos podem acessar esta area.");
        }
        return studentService.findById(session.getUserId());
    }

    @PutMapping("/me")
    public StudentResponse updateMe(@RequestHeader("Authorization") String authorization, @RequestBody UpdateStudentRequest request) {
        AuthSession session = authService.requireSession(authorization);
        return studentService.update(session.getUserId(), request);
    }

    @GetMapping("/me/transfers")
    public List<CoinTransferResponse> myTransfers(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas alunos podem acessar esta area.");
        }
        return transferRepository.findByStudentIdOrderByCriadoEmDesc(session.getUserId())
                .stream()
                .map(t -> {
                    CoinTransferResponse r = new CoinTransferResponse(t);
                    professorRepository.findById(t.getProfessorId()).ifPresent(p ->
                            r.withProfessorName(p.getNome()));
                    return r;
                })
                .toList();
    }

    @GetMapping("/me/purchases")
    public List<ProductPurchaseResponse> myPurchases(@RequestHeader("Authorization") String authorization) {
        AuthSession session = authService.requireSession(authorization);
        if (session.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas alunos podem acessar esta area.");
        }
        return purchaseRepository.findByStudentIdOrderByCriadoEmDesc(session.getUserId())
                .stream().map(ProductPurchaseResponse::new).toList();
    }

    @GetMapping("/institutions")
    public List<String> institutions() {
        return institutionService.listInstitutionNames();
    }
}

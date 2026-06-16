package br.com.emoney.service;

import br.com.emoney.dto.CoinTransferResponse;
import br.com.emoney.dto.ProductPurchaseResponse;
import br.com.emoney.model.AuthSession;
import br.com.emoney.repository.CompanyRepository;
import br.com.emoney.repository.ProductPurchaseRepository;
import br.com.emoney.repository.ProductRepository;
import br.com.emoney.repository.ProfessorRepository;
import br.com.emoney.repository.StudentRepository;
import br.com.emoney.repository.TransferRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatementService {
    private final TransferRepository transferRepository;
    private final ProductPurchaseRepository purchaseRepository;
    private final ProfessorRepository professorRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final ProductRepository productRepository;
    private final AuthorizationService authorizationService;

    public StatementService(TransferRepository transferRepository, ProductPurchaseRepository purchaseRepository,
                            ProfessorRepository professorRepository, StudentRepository studentRepository,
                            CompanyRepository companyRepository, ProductRepository productRepository,
                            AuthorizationService authorizationService) {
        this.transferRepository = transferRepository;
        this.purchaseRepository = purchaseRepository;
        this.professorRepository = professorRepository;
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.productRepository = productRepository;
        this.authorizationService = authorizationService;
    }

    public List<CoinTransferResponse> transfersForStudent(AuthSession session) {
        authorizationService.requireStudent(session);
        return transferRepository.findByStudentIdOrderByCriadoEmDesc(session.getUserId())
                .stream()
                .map(transfer -> {
                    CoinTransferResponse response = new CoinTransferResponse(transfer);
                    professorRepository.findById(transfer.getProfessorId()).ifPresent(professor ->
                            response.withProfessorInfo(professor.getNome(), professor.getPhotoUrl()));
                    return response;
                })
                .toList();
    }

    public List<ProductPurchaseResponse> purchasesForStudent(AuthSession session) {
        authorizationService.requireStudent(session);
        return purchaseRepository.findByStudentIdOrderByCriadoEmDesc(session.getUserId())
                .stream()
                .map(purchase -> {
                    ProductPurchaseResponse response = new ProductPurchaseResponse(purchase);
                    if (purchase.getCompanyId() != null) {
                        companyRepository.findById(purchase.getCompanyId())
                                .ifPresent(company -> response.withCompanyInfo(company.getNomeFantasia(), company.getPhotoUrl()));
                    }
                    if (purchase.getProductId() != null) {
                        productRepository.findById(purchase.getProductId())
                                .ifPresent(product -> response.withProductImage(product.getImageUrl()));
                    }
                    return response;
                })
                .toList();
    }

    public List<CoinTransferResponse> transfersForProfessor(AuthSession session) {
        authorizationService.requireProfessor(session);
        return transferRepository.findByProfessorIdOrderByCriadoEmDesc(session.getUserId())
                .stream()
                .map(transfer -> {
                    CoinTransferResponse response = new CoinTransferResponse(transfer);
                    studentRepository.findById(transfer.getStudentId()).ifPresent(student ->
                            response.withStudentInfo(student.getNome(), student.getEmail(), student.getCurso(), student.getPhotoUrl()));
                    return response;
                })
                .toList();
    }

}

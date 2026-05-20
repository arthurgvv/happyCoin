package br.com.emoney.service;

import br.com.emoney.dto.CompanyResponse;
import br.com.emoney.dto.RegisterCompanyRequest;
import br.com.emoney.dto.UpdateCompanyRequest;
import br.com.emoney.model.Company;
import br.com.emoney.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final ValidationService validationService;

    public CompanyService(CompanyRepository companyRepository, ValidationService validationService) {
        this.companyRepository = companyRepository;
        this.validationService = validationService;
    }

    public Company create(RegisterCompanyRequest request) {
        String email = validationService.text(request.getEmail(), "Email").toLowerCase();
        String cnpj = validationService.cnpj(request.getCnpj());

        if (companyRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(CONFLICT, "Ja existe empresa com este email.");
        }

        if (companyRepository.existsByCnpj(cnpj)) {
            throw new ResponseStatusException(CONFLICT, "Ja existe empresa com este CNPJ.");
        }

        Company company = new Company(
                validationService.text(request.getNomeFantasia(), "Nome fantasia"),
                cnpj,
                email,
                validationService.senha(request.getSenha())
        );

        return companyRepository.save(company);
    }

    public Company authenticate(String email, String senha) {
        Company company = companyRepository.findByEmail(validationService.text(email, "Email").toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Email ou senha invalidos."));

        if (!company.getSenha().equals(senha)) {
            throw new ResponseStatusException(NOT_FOUND, "Email ou senha invalidos.");
        }

        return company;
    }

    public Company findEntityById(UUID id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Empresa nao encontrada."));
    }

    public CompanyResponse findById(UUID id) {
        return new CompanyResponse(findEntityById(id));
    }

    public CompanyResponse update(UUID id, UpdateCompanyRequest request) {
        Company company = findEntityById(id);

        if (request.getNomeFantasia() != null && !request.getNomeFantasia().isBlank()) {
            company.setNomeFantasia(validationService.text(request.getNomeFantasia(), "Nome fantasia"));
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String email = request.getEmail().toLowerCase();
            companyRepository.findByEmail(email).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new ResponseStatusException(CONFLICT, "Ja existe empresa com este email.");
                }
            });
            company.setEmail(email);
        }
        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            company.setSenha(validationService.senha(request.getSenha()));
        }
        if (request.getPhotoUrl() != null) {
            company.setPhotoUrl(request.getPhotoUrl());
        }

        return new CompanyResponse(companyRepository.save(company));
    }
}

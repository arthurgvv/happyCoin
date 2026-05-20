package br.com.emoney.dto;

import br.com.emoney.model.Company;

import java.util.UUID;

public class CompanyResponse {
    private UUID id;
    private String nomeFantasia;
    private String cnpj;
    private String email;
    private String photoUrl;

    public CompanyResponse(Company company) {
        this.id = company.getId();
        this.nomeFantasia = company.getNomeFantasia();
        this.cnpj = company.getCnpj();
        this.email = company.getEmail();
        this.photoUrl = company.getPhotoUrl();
    }

    public UUID getId() {
        return id;
    }

    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public String getCnpj() {
        return cnpj;
    }

    public String getEmail() {
        return email;
    }

    public String getPhotoUrl() { return photoUrl; }
}

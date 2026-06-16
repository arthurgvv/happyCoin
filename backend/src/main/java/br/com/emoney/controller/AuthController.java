package br.com.emoney.controller;

import br.com.emoney.dto.AuthResponse;
import br.com.emoney.dto.LoginRequest;
import br.com.emoney.dto.RegisterInstitutionRequest;
import br.com.emoney.dto.RegisterCompanyRequest;
import br.com.emoney.dto.RegisterStudentRequest;
import br.com.emoney.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterStudentRequest request) {
        return authService.register(request);
    }

    @PostMapping("/companies/register")
    public AuthResponse registerCompany(@Valid @RequestBody RegisterCompanyRequest request) {
        return authService.registerCompany(request);
    }

    @PostMapping("/institutions/register")
    public AuthResponse registerInstitution(@Valid @RequestBody RegisterInstitutionRequest request) {
        return authService.registerInstitution(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public AuthResponse me(@RequestHeader("Authorization") String authorization) {
        return authService.me(authorization);
    }

    @PostMapping("/logout")
    public void logout(@RequestHeader("Authorization") String authorization) {
        authService.logout(authorization);
    }
}

package br.com.emoney.service.auth;

import br.com.emoney.dto.AuthResponse;
import br.com.emoney.dto.LoginRequest;

import java.util.Optional;

public interface RoleAuthenticationProvider {
    Optional<AuthResponse> authenticate(LoginRequest request);
}

package br.com.emoney.service;

import br.com.emoney.dto.AuthResponse;
import br.com.emoney.dto.LoginRequest;
import br.com.emoney.model.UserRole;
import br.com.emoney.repository.ProfessorRepository;
import br.com.emoney.repository.SessionRepository;
import br.com.emoney.service.auth.RoleAuthenticationProvider;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthServiceTest {

    @Test
    void loginReturnsFirstSuccessfulProviderResponse() throws Exception {
        AuthResponse expected = new AuthResponse("token", UserRole.STUDENT, new Object());
        RoleAuthenticationProvider failingProvider = request -> Optional.empty();
        RoleAuthenticationProvider successfulProvider = request -> Optional.of(expected);
        AuthService authService = new AuthService(
                null,
                null,
                null,
                null,
                null,
                List.of(failingProvider, successfulProvider)
        );

        AuthResponse response = authService.login(loginRequest());

        assertThat(response).isSameAs(expected);
    }

    @Test
    void loginRejectsWhenNoProviderAuthenticates() throws Exception {
        AuthService authService = new AuthService(
                null,
                null,
                null,
                null,
                null,
                List.of(request -> Optional.empty())
        );

        assertThatThrownBy(() -> authService.login(loginRequest()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Email ou senha invalidos");
    }

    private LoginRequest loginRequest() throws Exception {
        LoginRequest request = new LoginRequest();
        setField(request, "email", "aluno@gmail.com");
        setField(request, "senha", "senha123");
        return request;
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}

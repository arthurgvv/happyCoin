package br.com.emoney.repository;

import br.com.emoney.model.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthSessionJpaRepository extends JpaRepository<AuthSession, String> {
}

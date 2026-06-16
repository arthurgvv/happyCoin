package br.com.emoney.repository;

import br.com.emoney.model.Institution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InstitutionRepository extends JpaRepository<Institution, UUID> {

    Optional<Institution> findByEmail(String email);

    Optional<Institution> findByNomeIgnoreCase(String nome);

    boolean existsByIdentificadorInstitucional(String identificadorInstitucional);
}

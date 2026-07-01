# Relatório de Análise Crítica do Projeto

## 1. Informações do grupo
- **Curso:** Engenharia de Software
- **Disciplina:** Laboratório de Desenvolvimento de Software
- **Período:** 4° Período
- **Professor(a):** Prof. Dr. João Paulo Carneiro Aramuni
- **Membros do Grupo:** Matheus Guilherme, Miguel Moreira, Arthur Gonçalves

---

## 2. Identificação do Projeto
- **Nome do projeto:** Estudantes Lúmen (UniRewards)
- **Integrantes do outro grupo:** Vinícius Simões, Luiz Arthur
- **Link do repositório:** https://github.com/ViniSimoesV/Sistema-de-Moedas-Estudantil
- **Pull requests submetidos pelo seu grupo:**

  | Integrante | Refatoração | Link do PR |
  |------------|-------------|------------|
  | Matheus Guilherme | Remoção de Chamada Duplicada em AlunoService | https://github.com/ViniSimoesV/Sistema-de-Moedas-Estudantil/pull/2 |
  | Miguel Moreira | Extração de Método para Construção de E-mails em TransacaoService | https://github.com/ViniSimoesV/Sistema-de-Moedas-Estudantil/pull/2 |
  | Arthur Gonçalves | Remoção de Métodos Vazios (Dead Code) em Vantagem | https://github.com/ViniSimoesV/Sistema-de-Moedas-Estudantil/pull/2 |

---

## 3. Arquitetura e Tecnologias Utilizadas

O projeto **UniRewards** utiliza uma arquitetura monolítica em camadas no backend, seguindo o padrão MVC adaptado para API REST, com comunicação assíncrona para o envio de e-mails.

### Backend — Spring Boot
Desenvolvido em **Java 21** com **Spring Boot 3.x**, o backend segue a seguinte estrutura:

- **Controllers:** expõem os endpoints REST e delegam para a lógica de negócio.
- **Services:** concentram as regras de negócio e operações transacionais (`@Transactional`).
- **Repositories:** utilizam Spring Data JPA para acesso ao banco de dados PostgreSQL.
- **Entities/Models:** representam as estruturas de domínio mapeadas via Hibernate.
- **DTOs:** separam o contrato da API das entidades internas.
- **Facade:** orquestra fluxos que envolvem múltiplos serviços.
- **GlobalExceptionHandler:** centraliza o tratamento de erros via `@ControllerAdvice`.

Tecnologias empregadas:
- Spring Boot 3.x, Spring Data JPA, Spring Security
- PostgreSQL (via Supabase em produção)
- RabbitMQ (via CloudAMQP) para envio assíncrono de e-mails
- JavaMailSender para disparo de mensagens
- Docker (para ambiente local do RabbitMQ)
- Render (backend), Vercel (frontend), Supabase (banco em nuvem)

### Frontend — React + Vite
O frontend foi desenvolvido com **React** e **Vite**, utilizando **JavaScript ES6+** e **CSS**. A comunicação com o backend ocorre via chamadas REST à API.

### Integração entre Camadas
O backend expõe endpoints REST consumidos pelo frontend via `fetch`. Os Controllers não conhecem a camada de persistência e os Services não dependem dos Controllers.

---

## 4. Organização do GitHub e Fluxo de Trabalho Colaborativo

### 4.1. Estrutura do Repositório e Documentação
- **Estrutura de Pastas:** Organização clara com `/frontend`, `/src`, `/documentos` (com subpastas para cada tipo de diagrama). Segue as convenções do Spring Boot.
- **Documentação Essencial:** O `README.md` contém descrição do projeto, histórias do usuário, tecnologias, pré-requisitos (Java 21, PostgreSQL, RabbitMQ, Docker), instruções de execução local e via Docker Compose, variáveis de ambiente em tabela, estrutura de pastas e link para a demo em produção.

### 4.2. Gerenciamento de Tarefas (Issues)
- Não foram encontradas Issues abertas ou fechadas no repositório. O desenvolvimento foi conduzido sem uso do sistema de Issues para rastreamento de tarefas ou bugs.

### 4.3. Fluxo de Trabalho (Pull Requests e Branches)
- O repositório possui apenas a branch `main`, sem branches de feature identificadas.
- Foi encontrado 1 Pull Request aberto por colaborador externo (`#1 Lab05S02 - Proposta de Refatorações`). Não há PRs internos entre os membros do grupo, indicando que as contribuições foram feitas por commits diretos na branch principal.

### 4.4. Padrões de Commits e Versionamento
- As mensagens de commit não seguem um padrão definido. Exemplos: `"diagrama comunicação"`, `"Add files via upload"`, `"Update README.md"`. Não há uso de prefixos como `feat:`, `fix:` ou `refactor:`.
- O projeto não utiliza Tags ou Releases para marcar versões, apesar de exibir o badge `v1.0.0` no README.

> [!TIP]
> A adoção de [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) melhoraria a rastreabilidade e permitiria a geração automática de changelogs.

---

## 5. Dificuldade para Configuração do Ambiente

### 5.1. Requisitos de Linguagem e Ferramentas de Build
- **Versão do Java:** O projeto exige **Java 21**, documentado nos pré-requisitos do README. Com versões anteriores o build falha.
- **Ferramenta de Build:** Utiliza **Maven** com o Maven Wrapper incluído (`mvnw`), sem necessidade de instalação global.

### 5.2. Configuração de Persistência e Variáveis de Ambiente
- O projeto depende de variáveis de ambiente críticas (`DB_PASSWORD`, `RABBITMQ_HOST`, `RABBITMQ_PASS`, `RABBITMQ_USER`, `RABBITMQ_VHOST`, `RABBITMQ_PORT`) que devem ser configuradas no `application.properties`. O README documenta todas em tabela.
- O banco em produção usa **Supabase**. Localmente é necessário PostgreSQL ou Docker Compose.
- O **RabbitMQ** em produção usa CloudAMQP. Localmente o `docker-compose.yml` incluso sobe uma instância com credenciais padrão.

### 5.3. Passos para Subir o Ambiente e Soluções Aplicadas
- **Passos para execução local:**
  1. Clonar o repositório e instalar Java 21.
  2. Subir o RabbitMQ com `docker-compose up -d`.
  3. Configurar as variáveis de banco e fila no `application.properties`.
  4. Executar `./mvnw spring-boot:run` para o backend.
  5. Abrir o frontend pelo navegador.
- **Principal dificuldade:** Não há um arquivo `application.properties` de exemplo com valores fictícios. O README documenta as variáveis, mas um arquivo de exemplo tornaria a configuração inicial mais direta.

---

## 6. Análise de Qualidade do Código e Testes

### 6.1. Design e Princípios SOLID
- **Separação de Responsabilidades:** A separação em camadas (Controller → Service → Repository) está bem aplicada. Os Controllers são enxutos.
- **Facade Pattern:** O uso do `MoedaFacade` para orquestrar fluxos compostos evita Controllers sobrecarregados.
- **Code Smells identificados:**
  - **Dead Code:** A classe `Vantagem.java` contém três métodos completamente vazios (`cadastrarVantagem()`, `consultarVantagem()`, `excluirVantagem()`), copiados do diagrama UML mas nunca implementados e nunca chamados.
  - **Duplicated Code:** O `TransacaoService.java` repete o mesmo bloco de construção de `EmailTransacaoDTO` (instanciação + 5 setters) quatro vezes dentro do método `processarTransferencia`.
  - **Duplicate Statement:** No método `atualizar` de `AlunoService.java`, `aluno.setNome(dto.getNome())` é chamado duas vezes seguidas — a primeira é sobrescrita pela segunda sem produzir efeito.

### 6.2. Testabilidade e Cobertura
- **Presença de Testes:** O projeto não possui testes automatizados. Nenhum arquivo foi encontrado em `src/test/java`.
- **Cobertura:** 0% — nenhuma funcionalidade crítica está coberta por testes.
- **Impacto:** Sem testes, qualquer alteração em fluxos transacionais como `processarTransferencia` ou `resgatarVantagem` pode introduzir regressões difíceis de detectar.

### 6.3. Segurança e Tratamento de Erros (OWASP Top 10)
- **Senhas:** BCrypt está corretamente aplicado em `AlunoService`, `ProfessorService` e `EmpresaService`.
- **Autenticação:** Spring Security está configurado para proteger os endpoints.
- **Tratamento de Exceções:** O `GlobalExceptionHandler` captura `IllegalArgumentException` (400) e `RuntimeException` (500), mas o handler de 500 retorna `ex.getMessage()` diretamente ao cliente, expondo detalhes internos — violação do OWASP A05.
- **Validação de Entrada:** Não há `@Valid` ou `@NotNull` nos DTOs. A validação é feita manualmente nos Services.
- **Debug em produção:** `TransacaoService.java` contém um `System.out.println` que imprime o host do RabbitMQ em produção.

---

## 7. Sugestões de Melhorias

1. **Adicionar testes automatizados:** Implementar testes unitários com JUnit/Mockito para `TransacaoService` e `PagamentoService`, buscando ao menos 70% de cobertura nas regras de negócio.
2. **Adotar Conventional Commits:** Padronizar mensagens de commit com prefixos `feat:`, `fix:`, `refactor:`, `docs:`.
3. **Validação de DTOs com Bean Validation:** Adicionar `@Valid`, `@NotNull`, `@NotBlank` e `@Positive` nos DTOs e `@Validated` nos Controllers.
4. **Corrigir vazamento de informação no GlobalExceptionHandler:** O handler de `RuntimeException` não deve retornar `ex.getMessage()` ao cliente — deve retornar mensagem genérica e logar o erro internamente.
5. **Remover logs de debug em produção:** Substituir `System.out.println` e `System.err.println` por SLF4J/Logback.
6. **Usar PRs internos:** Adotar o fluxo de feature branches + Pull Requests entre os membros para rastrear decisões e habilitar revisão de código.
7. **Adicionar arquivo de configuração de exemplo:** Incluir um `application.properties.example` com valores fictícios para facilitar o setup inicial.

---

## 8. Refatorações Propostas

---

### Refatoração 1 – Remoção de Métodos Vazios (Remove Dead Code)

**Arquivo:** `src/main/java/br/com/lumens/unirewards/model/Vantagem.java`  
**Pull Request:** https://github.com/ViniSimoesV/Sistema-de-Moedas-Estudantil/pull/2

#### Antes
```java
// Métodos baseados no seu diagrama de classe
public void cadastrarVantagem() {
    // Lógica de persistência será feita no VantagemService
}

public void consultarVantagem() {
    // Lógica de busca via Repository
}

public void excluirVantagem() {
    // Lógica para desativar ou deletar a vantagem
}
```

#### Depois
```java
// Métodos removidos — persistência, consulta e exclusão
// são responsabilidade de VantagemService e VantagemRepository.
```

#### Tipo de refatoração aplicada
- **Remove Dead Code**

#### Justificativa técnica
Os três métodos são corpos vazios copiados do diagrama UML que nunca foram implementados e não são chamados em nenhum ponto do sistema. Entidades JPA devem representar dados de domínio, não conter lógica de negócio vazia. O método `editarVantagem` foi preservado por ter implementação real. A remoção reduz o tamanho da classe e evita confusão para quem lê o código.

---

### Refatoração 2 – Extração de Método (Extract Method)

**Arquivo:** `src/main/java/br/com/lumens/unirewards/service/TransacaoService.java`  
**Pull Request:** https://github.com/ViniSimoesV/Sistema-de-Moedas-Estudantil/pull/2

#### Antes
```java
// Bloco repetido 4 vezes com estrutura idêntica
EmailTransacaoDTO emailAluno = new EmailTransacaoDTO();
emailAluno.setEmailDestino(alunoDestinatario.getEmail());
emailAluno.setNomeDestino(alunoDestinatario.getNome());
emailAluno.setNomeOutraParte("Prof. " + professorRemetente.getNome());
emailAluno.setValor(dto.getValor());
emailAluno.setMotivo(dto.getMotivo());
emailAluno.setTipo("RECEBIDO");
publicarEmailTransacao(emailAluno);
```

#### Depois
```java
// Método auxiliar extraído
private EmailTransacaoDTO criarEmailTransacao(
        String emailDestino, String nomeDestino,
        String nomeOutraParte, Integer valor,
        String motivo, String tipo) {
    EmailTransacaoDTO email = new EmailTransacaoDTO();
    email.setEmailDestino(emailDestino);
    email.setNomeDestino(nomeDestino);
    email.setNomeOutraParte(nomeOutraParte);
    email.setValor(valor);
    email.setMotivo(motivo);
    email.setTipo(tipo);
    return email;
}

// Uso
publicarEmailTransacao(criarEmailTransacao(
    alunoDestinatario.getEmail(), alunoDestinatario.getNome(),
    "Prof. " + professorRemetente.getNome(),
    dto.getValor(), dto.getMotivo(), "RECEBIDO"));
```

#### Tipo de refatoração aplicada
- **Extract Method**

#### Justificativa técnica
O bloco de construção de `EmailTransacaoDTO` (instanciação + 5 setters) se repete 4 vezes dentro de `processarTransferencia`. Qualquer mudança no contrato do DTO exigiria atualização nos quatro pontos, violando o princípio DRY. A extração para `criarEmailTransacao` centraliza essa lógica em um único lugar e reduz a verbosidade do método principal.

---

### Refatoração 3 – Remoção de Chamada Duplicada (Remove Duplicate Statement)

**Arquivo:** `src/main/java/br/com/lumens/unirewards/service/AlunoService.java`  
**Pull Request:** https://github.com/ViniSimoesV/Sistema-de-Moedas-Estudantil/pull/2

#### Antes
```java
@Transactional
public Aluno atualizar(Long id, AlunoDTO dto) {
    Aluno aluno = alunoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

    aluno.setNome(dto.getNome());   // linha 114: redundante
    if (dto.getSenha() != null && !dto.getSenha().isEmpty()) {
        aluno.setSenha(passwordEncoder.encode(dto.getSenha()));
    }

    aluno.setNome(dto.getNome());   // linha 120: sobrescreve a anterior
    aluno.setEmail(dto.getEmail());
    aluno.setRg(dto.getRg());
    // ...
}
```

#### Depois
```java
@Transactional
public Aluno atualizar(Long id, AlunoDTO dto) {
    Aluno aluno = alunoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

    if (dto.getSenha() != null && !dto.getSenha().isEmpty()) {
        aluno.setSenha(passwordEncoder.encode(dto.getSenha()));
    }

    aluno.setNome(dto.getNome());
    aluno.setEmail(dto.getEmail());
    aluno.setRg(dto.getRg());
    // ...
}
```

#### Tipo de refatoração aplicada
- **Remove Duplicate Statement**

#### Justificativa técnica
`aluno.setNome(dto.getNome())` aparece duas vezes consecutivas no método `atualizar`. A primeira é imediatamente sobrescrita pela segunda e não produz nenhum efeito. A remoção não altera o comportamento do sistema.

---

## 9. Conclusão

A análise do projeto **UniRewards** identificou boas decisões de arquitetura: separação em camadas clara, uso de mensageria assíncrona com RabbitMQ e README bem documentado. A aplicação está em produção (Vercel + Render + Supabase).

Os principais problemas encontrados foram a ausência total de testes automatizados e alguns code smells pontuais (código morto, duplicações) que não afetam o funcionamento mas aumentam o custo de manutenção.

As três refatorações propostas corrigem problemas reais identificados no código sem alterar o comportamento do sistema.

---

## 10. Referências
- Fowler, M. — *Refactoring: Improving the Design of Existing Code* (2ª ed., 2018)
- Revisando alterações em Pull Requests:  
  https://docs.github.com/pt/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/commenting-on-a-pull-request
- Guia oficial de Conventional Commits:  
  https://www.conventionalcommits.org/pt-br/v1.0.0/
- Documentação do Spring Boot:  
  https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/
- OWASP Top 10:  
  https://owasp.org/www-project-top-ten/

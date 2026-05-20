# happyCoin

<div align="center">
  <img src="docs/happyCoin.png" alt="happyCoin Logo" width="300px"/>
</div>

<br/>

<div align="justify">
  O <b>happyCoin</b> é um sistema de moeda estudantil desenvolvido para a disciplina de Laboratório de Desenvolvimento de Software da PUC Minas. Professores distribuem moedas como reconhecimento a alunos, que podem resgatá-las como vantagens junto a empresas parceiras. Instituições de ensino gerenciam professores e iniciam semestres, creditando saldo automaticamente.
</div>

![Java](https://img.shields.io/badge/Java-21-007ec6?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-007ec6?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-007ec6?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-007ec6?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-007ec6?style=for-the-badge&logo=vite&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-3.9-007ec6?style=for-the-badge&logo=apachemaven&logoColor=white)

---

## Indice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Instalacao e Execucao](#instalacao-e-execucao)
  - [Pre-requisitos](#pre-requisitos)
  - [Variaveis de Ambiente](#variaveis-de-ambiente)
  - [Instalacao de Dependencias](#instalacao-de-dependencias)
  - [Banco de Dados](#banco-de-dados)
  - [Como Executar](#como-executar)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Credenciais de Teste](#credenciais-de-teste)
- [Testes](#testes)
- [Autores](#autores)
- [Licença](#licença)

---

## Sobre o Projeto

O happyCoin digitaliza o reconhecimento academico dentro de instituicoes de ensino. Professores recebem 1.000 moedas por semestre e as distribuem a alunos como recompensa por desempenho, participacao e comportamento. Alunos acumulam moedas e as trocam por vantagens: descontos, produtos e vouchers cadastradas por empresas parceiras. Cada transacao gera notificacao por email e registro de extrato.

**Atores do sistema:**

| Ator | Descricao |
|---|---|
| Aluno | Recebe moedas de professores e resgata vantagens |
| Professor | Distribui moedas com mensagem de reconhecimento obrigatoria |
| Instituicao | Cadastra professores e inicia semestres |
| Empresa Parceira | Cadastra vantagens disponiveis para resgate |

---

## Funcionalidades Principais

- **Autenticacao por ator:** Login separado para aluno, professor, instituicao e empresa parceira.
- **Cadastro de alunos e empresas:** Alunos e empresas se auto-cadastram; professores sao cadastrados pela instituicao.
- **Envio de moedas:** Professor seleciona aluno, define valor e mensagem de reconhecimento obrigatoria; saldos sao atualizados imediatamente.
- **Recarga semestral automatica:** Instituicao inicia o semestre e 1.000 moedas sao creditadas a cada professor vinculado.
- **Catalogo de vantagens:** Empresas parceiras cadastram vantagens com nome, descricao, foto e custo em moedas.
- **Resgate de vantagens:** Aluno resgata vantagem com saldo suficiente; cupom com codigo unico e gerado e enviado por email ao aluno e a empresa.
- **Extrato de transacoes:** Alunos e professores consultam historico completo de envios e resgates com data, valor e origem/destino.
- **Notificacoes por email:** Envio automatico ao aluno ao receber moedas e ao aluno/empresa apos resgate de vantagem.

---

## Tecnologias Utilizadas

### Front-end

| Tecnologia | Versao | Papel |
|---|---|---|
| React | 19 | Framework de UI |
| Vite | 6 | Build tool e dev server |
| JavaScript | ES6+ | Linguagem |

### Back-end

| Tecnologia | Versao | Papel |
|---|---|---|
| Java | 21 | Linguagem |
| Spring Boot | 3.3.5 | Framework principal |
| Spring Data JPA | 3.3.5 | Camada de acesso a dados (ORM) |
| Hibernate | 6.x | Implementacao JPA |
| PostgreSQL | 16 | Banco de dados relacional |
| Maven | 3.9 | Gerenciador de build e dependencias |
| JUnit 5 + Mockito | — | Testes unitarios |

---

## Arquitetura

O happyCoin segue a arquitetura **MVC em camadas**, com separacao clara entre controladores REST, logica de negocio, acesso a dados e representacao das entidades.

**Camadas:**

| Camada | Responsabilidade |
|---|---|
| `controller` | Endpoints REST (`@RestController`) - recebe e valida requisicoes HTTP |
| `service` | Regras de negocio, validacoes, orquestracao |
| `repository` | Interfaces `JpaRepository<T, UUID>` - acesso ao banco via Spring Data |
| `model` | Entidades JPA (`@Entity`) mapeadas para tabelas PostgreSQL |
| `dto` | Objetos de transferencia de dados (request/response) |
| `config` | Configuracoes de CORS |

**Estrategia de persistencia:**

- Todos os models anotados com `@Entity`, `@Id` e `@Column`
- IDs sao `UUID` gerados pela aplicacao via `UUID.randomUUID()`
- Repositories estendem `JpaRepository<T, UUID>` - metodos customizados por convencao de nome (`findByEmail`, `existsByCpf`, `findByInstitutionId`)
- `@ElementCollection(fetch = EAGER)` para `Professor.cursos` (tabela auxiliar `professor_cursos`)
- `ddl-auto=update`: Hibernate cria e atualiza o schema automaticamente
- `data.sql` insere dados iniciais com `ON CONFLICT DO NOTHING`
- Sessoes de autenticacao mantidas em memoria (`ConcurrentHashMap`) - nao persistidas

**Relacionamentos:**

```
Institution ──1:N──► Professor
Institution ──1:N──► Student
Professor   ──1:N──► CoinTransfer
Student     ──1:N──► CoinTransfer
Company     ──1:N──► Product
```

### Diagramas

| Diagrama de Classes | Diagrama de Componentes |
| :---: | :---: |
| <img src="docs/DiagramaDeClasses.png" alt="Diagrama de Classes" width="350px"> | <img src="docs/DiagramaDeComponentes.png" alt="Diagrama de Componentes" width="350px"> |

| Diagrama de Casos de Uso | Diagrama ER |
| :---: | :---: |
| <img src="docs/DiagramaCasoDeUso-v2.png" alt="Diagrama de Casos de Uso" width="350px"> | <img src="docs/DER.jpeg" alt="Diagrama ER" width="350px"> |

---

## Instalacao e Execucao

### Pre-requisitos

- Java 21+
- Maven 3.9+
- Node.js 18+ e npm
- PostgreSQL 16

### Variaveis de Ambiente

#### Back-end (Spring Boot)

Configure em `backend/src/main/resources/application.properties`:

| Propriedade | Descricao | Padrao |
| :--- | :--- | :--- |
| `spring.datasource.url` | URL de conexao JDBC com o PostgreSQL | `jdbc:postgresql://...` |
| `spring.datasource.username` | Usuario do banco de dados | `postgres` |
| `spring.datasource.password` | Senha do banco de dados | `postgres` |
| `spring.jpa.hibernate.ddl-auto` | Estrategia de criacao do schema | `update` |

#### Front-end (React + Vite)

Crie um arquivo `.env` na raiz de `/frontend`:

| Variavel | Descricao | Exemplo |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL base da API do Back-end | `http://seu-servidor/api` |

### Instalacao de Dependencias

#### Front-end (React)

```bash
cd frontend
npm install
```

#### Back-end (Spring Boot)

```bash
cd backend
mvn clean install
```

### Banco de Dados

Crie o banco antes de subir o back-end:

```sql
CREATE DATABASE moeda_estudantil;
```

O Hibernate cria as tabelas automaticamente na primeira execucao. O arquivo `data.sql` insere os dados iniciais (instituicoes PUC Minas, UFMG e CEFET-MG, professor padrao e catalogo de produtos).

### Como Executar

**Terminal 1 — Back-end:**

```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 — Front-end:**

```bash
cd frontend
npm run dev
```

---

## Estrutura de Pastas

```
.
├── README.md
├── docs/                              # Diagramas e documentacao
│   ├── happyCoin.png
│   ├── DiagramaDeClasses.png
│   ├── DiagramaDeComponentes.png
│   ├── DiagramaCasoDeUso-v2.png
│   ├── HistoriasDeUsuario.pdf
│   └── historias-usuario.md
│
├── frontend/                          # Aplicacao React
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   └── assets/                   # Imagens e icones publicos
│   └── src/
│       ├── components/               # Componentes reutilizaveis (Navbar, etc.)
│       ├── hooks/                    # Hooks personalizados
│       ├── pages/                    # Paginas da aplicacao (AuthPage, etc.)
│       └── services/                 # Chamadas HTTP (apiClient.js)
│
└── backend/                           # Aplicacao Spring Boot
    ├── pom.xml
    └── src/
        ├── main/
        │   ├── java/br/com/happyCoin/
        │   │   ├── controller/        # Endpoints REST
        │   │   ├── service/           # Regras de negocio
        │   │   ├── repository/        # Interfaces JpaRepository
        │   │   ├── model/             # Entidades JPA
        │   │   ├── dto/               # Objetos de transferencia de dados
        │   │   └── config/            # Configuracoes (CORS)
        │   └── resources/
        │       ├── application.properties
        │       └── data.sql           # Dados iniciais (seed)
        └── test/
            └── java/br/com/happyCoin/  # Testes unitarios (JUnit 5 + Mockito)
```

---

## Credenciais de Teste

**Professor padrao (pre-cadastrado):**

```
Email: professor@happyCoin.com
Senha: Professor123
Saldo: 1.000 moedas
```

**Instituicoes pre-cadastradas:**

| Instituicao | Email |
|---|---|
| PUC Minas | contato@pucminas.br |
| UFMG | contato@ufmg.br |
| CEFET-MG | contato@cefetmg.br |

Para testar o fluxo completo: faca login com uma instituicao, cadastre um professor, cadastre um aluno na mesma instituicao e curso, e use o professor para enviar moedas.

---

## Testes

### Testes Unitarios (JUnit 5 + Mockito)

```bash
cd backend
mvn test
```

Os testes cobrem as regras de negocio dos services (`InstitutionService`, `ProfessorService`) usando mocks dos repositories via Mockito (`@ExtendWith(MockitoExtension.class)`).

---

## Autores

| 👤 Nome | 🖼️ Foto | GitHub | LinkedIn | Email |
|--------|--------|--------|----------|-------|
| Arthur Gonçalves Vieira | <img src="https://github.com/arthurgvv/portfolio-profissional/blob/b2ba05915144647c956bac70dcb435ec0ce55927/portfolio/src/assets/styles/profile.jpg" width="100px" style="border-radius:50%;"> | <a href="https://github.com/arthurgvv"><img src="https://img.shields.io/badge/GitHub-000?style=for-the-badge&logo=github&logoColor=white"></a> | <a href="https://www.linkedin.com/in/arthur-goncalves-62b15232a/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white"></a> | <a href="mailto:arthurgvkj@gmail.com"><img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white"></a> |
| Matheus Guilherme | <img src="./docs/assets/matheus.jpeg" width="100px" style="border-radius:50%;"> | <a href="https://github.com/theuzao"><img src="https://img.shields.io/badge/GitHub-000?style=for-the-badge&logo=github&logoColor=white"></a> | Adicionar LinkedIn | Adicionar email |
| Miguel Moreira | <img src="./docs/assets/mmoreira.png" width="100px" style="border-radius:50%;"> | <a href="https://github.com/mmoreira41"><img src="https://img.shields.io/badge/GitHub-000?style=for-the-badge&logo=github&logoColor=white"></a> | <a href="https://www.linkedin.com/in/miguel-moreira-69a171269/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white"></a> | Adicionar email |

---
> Disciplina: Laboratorio de Desenvolvimento de Software — PUC Minas

## Licença

Este projeto é distribuído sob a [Licença MIT](./LICENSE).

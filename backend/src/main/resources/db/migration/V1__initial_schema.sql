CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    senha VARCHAR(255),
    telefone VARCHAR(255),
    endereco VARCHAR(255),
    identificador_institucional VARCHAR(255) UNIQUE,
    photo_url TEXT,
    criado_em TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY,
    nome_fantasia VARCHAR(255) NOT NULL,
    cnpj VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    senha VARCHAR(255),
    photo_url TEXT
);

CREATE TABLE IF NOT EXISTS professors (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    senha VARCHAR(255),
    institution_id UUID,
    saldo_moedas INTEGER,
    ultimo_aviso VARCHAR(255),
    photo_url TEXT
);

CREATE TABLE IF NOT EXISTS professor_cursos (
    professor_id UUID NOT NULL,
    curso VARCHAR(255),
    CONSTRAINT uk_professor_cursos_professor_curso UNIQUE (professor_id, curso)
);

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    cpf VARCHAR(255) UNIQUE,
    rg VARCHAR(255),
    endereco VARCHAR(255),
    institution_id UUID,
    instituicao VARCHAR(255),
    curso VARCHAR(255),
    senha VARCHAR(255),
    saldo_moedas INTEGER,
    ultimo_aviso VARCHAR(255),
    photo_url TEXT,
    criado_em TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    empresa_parceira VARCHAR(255),
    descricao TEXT,
    custo_moedas INTEGER,
    image_url TEXT,
    company_id UUID,
    quantidade INTEGER,
    ativo BOOLEAN,
    version BIGINT
);

CREATE TABLE IF NOT EXISTS coin_transfers (
    id UUID PRIMARY KEY,
    professor_id UUID,
    student_id UUID,
    quantidade INTEGER,
    motivo TEXT,
    criado_em TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_purchases (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    company_id UUID,
    student_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    custo_moedas INTEGER,
    criado_em TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY,
    from_id UUID NOT NULL,
    from_role VARCHAR(255) NOT NULL,
    from_nome VARCHAR(255),
    to_id UUID NOT NULL,
    to_role VARCHAR(255) NOT NULL,
    to_nome VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    lido BOOLEAN NOT NULL,
    reply_to_id UUID,
    type VARCHAR(255),
    purchase_id UUID,
    criado_em TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    token VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL,
    role VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP
);

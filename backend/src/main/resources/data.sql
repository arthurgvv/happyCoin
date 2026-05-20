-- ============================================================
-- INSTITUICOES
-- ============================================================
INSERT INTO institutions (id, nome, email, senha, telefone, endereco, identificador_institucional, criado_em)
VALUES
    ('00000001-0000-0000-0000-000000000001', 'PUC Minas',        'contato@pucminas.br',    'PucMinas1',  '(31) 3319-4444', 'Belo Horizonte, MG', '17311498000161', NOW()),
    ('00000001-0000-0000-0000-000000000002', 'UFMG',             'contato@ufmg.br',         'Ufmg12345',  '(31) 3409-4000', 'Belo Horizonte, MG', '17217985000104', NOW()),
    ('00000001-0000-0000-0000-000000000003', 'CEFET-MG',         'contato@cefetmg.br',      'Cefet1234',  '(31) 3319-7000', 'Belo Horizonte, MG', '21220299000121', NOW()),
    ('00000001-0000-0000-0000-000000000004', 'Instituicao Demo', 'contato@instituicao.com', 'Inst1234',   '(31) 3000-0000', 'Belo Horizonte, MG', '00000000000100', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- EMPRESAS
-- ============================================================
INSERT INTO companies (id, nome_fantasia, cnpj, email, senha)
VALUES
    ('00000004-0000-0000-0000-000000000001', 'Empresa Demo',       '00000000000101', 'empresa@empresa.com',        'Emp1234'),
    ('00000004-0000-0000-0000-000000000002', 'Mercado Aurora',     '00000000000102', 'parceiro@mercadoaurora.com', 'Emp1234'),
    ('00000004-0000-0000-0000-000000000003', 'Sabor Central',      '00000000000103', 'parceiro@saborcentral.com',  'Emp1234'),
    ('00000004-0000-0000-0000-000000000004', 'Banco Prisma',       '00000000000104', 'parceiro@bancoprisma.com',   'Emp1234'),
    ('00000004-0000-0000-0000-000000000005', 'Loja Lume',          '00000000000105', 'parceiro@lojalume.com',      'Emp1234'),
    ('00000004-0000-0000-0000-000000000006', 'Mobilidade Vitta',   '00000000000106', 'parceiro@mobilidadevitta.com','Emp1234')
ON CONFLICT (id) DO UPDATE SET
    nome_fantasia = EXCLUDED.nome_fantasia,
    cnpj          = EXCLUDED.cnpj,
    email         = EXCLUDED.email,
    senha         = EXCLUDED.senha;

-- ============================================================
-- LIMPEZA DE DADOS LEGADOS (mantém apenas contas de acesso rápido)
-- ============================================================
DELETE FROM coin_transfers;
DELETE FROM product_purchases;
DELETE FROM professor_cursos WHERE professor_id <> '00000002-0000-0000-0000-000000000001';
DELETE FROM students WHERE email <> 'aluno@aluno.com';
DELETE FROM professors WHERE email <> 'professor@emoney.com';

-- ============================================================
-- PROFESSORES (vinculados a instituicoes com cursos definidos)
-- ============================================================
INSERT INTO professors (id, nome, cpf, email, senha, institution_id, saldo_moedas, ultimo_aviso)
VALUES
    -- Conta do acesso rápido (Professor) - começa com 0
    ('00000002-0000-0000-0000-000000000001', 'Prof. Carlos Mendes',    NULL, 'professor@emoney.com',     'Professor123', '00000001-0000-0000-0000-000000000001', 0,  '')
ON CONFLICT DO NOTHING;

-- Cursos dos professores (professor e aluno devem compartilhar instituicao + curso)
DELETE FROM professor_cursos
WHERE professor_id IN (
    '00000002-0000-0000-0000-000000000001'
);

INSERT INTO professor_cursos (professor_id, curso)
VALUES
    -- Professor do acesso rápido (mantém 2 cursos pra conseguir listar alunos quando você criar manualmente)
    ('00000002-0000-0000-0000-000000000001', 'Engenharia de Software'),
    ('00000002-0000-0000-0000-000000000001', 'Ciencia da Computacao');

-- ============================================================
-- ALUNOS (mesma instituicao e curso do professor que os orienta)
-- ============================================================
INSERT INTO students (id, nome, email, cpf, rg, endereco, institution_id, instituicao, curso, senha, saldo_moedas, ultimo_aviso, criado_em)
VALUES
    -- Conta do acesso rápido (Aluno) - começa com 0
    ('00000005-0000-0000-0000-000000000002', 'Aluno Demo',      'aluno@aluno.com',       '00000000002', '000000002', 'Belo Horizonte, MG', '00000001-0000-0000-0000-000000000001', 'PUC Minas', 'Engenharia de Software',   'Aluno1234',  0, '', NOW())
ON CONFLICT (id) DO UPDATE SET
    nome           = EXCLUDED.nome,
    email          = EXCLUDED.email,
    cpf            = EXCLUDED.cpf,
    rg             = EXCLUDED.rg,
    endereco       = EXCLUDED.endereco,
    institution_id = EXCLUDED.institution_id,
    instituicao    = EXCLUDED.instituicao,
    curso          = EXCLUDED.curso,
    senha          = EXCLUDED.senha,
    saldo_moedas   = EXCLUDED.saldo_moedas,
    ultimo_aviso   = EXCLUDED.ultimo_aviso;

-- Limpa dados de movimentação seed (começar do zero com dados reais)
DELETE FROM coin_transfers;
DELETE FROM product_purchases;

-- ============================================================
-- PRODUTOS (alguns vinculados a Empresa Demo)
-- ============================================================
DELETE FROM products
WHERE id IN (
    '00000003-0000-0000-0000-000000000007',
    '00000003-0000-0000-0000-000000000008',
    '00000003-0000-0000-0000-000000000009',
    '00000003-0000-0000-0000-000000000010'
);

INSERT INTO products (id, nome, empresa_parceira, descricao, custo_moedas, image_url, company_id)
VALUES
    ('00000003-0000-0000-0000-000000000001', 'Fundamentos da Arquitetura de Software', 'Editora Horizonte', 'Uma abordagem moderna para engenharia e arquitetura de software.',              180, '/assets/products/fundamentos-arquitetura-software.jpg', NULL),
    ('00000003-0000-0000-0000-000000000002', 'Criando Microservicos',                  'Editora Horizonte', 'Projetando sistemas com componentes menores e mais especializados.',            170, '/assets/products/criando-microservicos.jpg',            NULL),
    ('00000003-0000-0000-0000-000000000003', 'Programacao Utilizando IA',              'Empresa Demo',     'Otimizando planejamento, programacao, testes e implantacao com IA.',            150, '/assets/products/programacao-utilizando-ia.jpg',        '00000004-0000-0000-0000-000000000001'),
    ('00000003-0000-0000-0000-000000000004', 'Fluencia em Dados e IA',                 'Empresa Demo',     'Estrategias e praticas para trabalhar e viver em um mundo dirigido por dados.', 160, '/assets/products/fluencia-dados-ia.png',                '00000004-0000-0000-0000-000000000001'),
    ('00000003-0000-0000-0000-000000000005', 'Voucher Cantina Aurora',                 'Empresa Demo',     'Voucher especial para usar em doces e salgados da Cantina Aurora.',             80,  '/assets/products/boca-forno.png',                       '00000004-0000-0000-0000-000000000001'),
    ('00000003-0000-0000-0000-000000000006', 'Desconto de Mensalidade',                'Empresa Demo',     'Credito simbolico para abatimento em mensalidade academica.',                    500, '/assets/products/mensalidade.svg',                      '00000004-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET
    nome             = EXCLUDED.nome,
    empresa_parceira = EXCLUDED.empresa_parceira,
    descricao        = EXCLUDED.descricao,
    custo_moedas     = EXCLUDED.custo_moedas,
    image_url        = EXCLUDED.image_url,
    company_id       = EXCLUDED.company_id;

-- ============================================================
-- TRANSFERENCIAS DE MOEDAS (professores → alunos)
-- ============================================================
-- (seed removido) - começar do zero com dados reais

-- ============================================================
-- RESGATES DE PRODUTOS (alunos → produtos da Empresa Demo)
-- saldo dos alunos ja reflete as compras acima
-- ============================================================
-- (seed removido) - começar do zero com dados reais

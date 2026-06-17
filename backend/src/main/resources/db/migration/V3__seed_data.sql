INSERT INTO institutions (id, nome, email, senha, telefone, endereco, identificador_institucional, criado_em)
VALUES
    ('00000001-0000-0000-0000-000000000001', 'PUC Minas',        'contato@pucminas.br',    '$2a$10$fnZEMBlDuKR/4pX1oyuoC.gB8keVk9dCIFwHk.tva5eBfV0JNtIvO', '(31) 3319-4444', 'Belo Horizonte, MG', '17311498000161', NOW()),
    ('00000001-0000-0000-0000-000000000002', 'UFMG',             'contato@ufmg.br',        '$2a$10$/GfP0WimglpkHqJ3bXsE/eHGhs83dDY816xgPZw7gEKccQ9y6SDpS', '(31) 3409-4000', 'Belo Horizonte, MG', '17217985000104', NOW()),
    ('00000001-0000-0000-0000-000000000003', 'CEFET-MG',         'contato@cefetmg.br',     '$2a$10$HGiPAbFEb.UAMp8aQN3dyeJnxwpBpVE88Scua6OT5Hrm3e/KlSzPK', '(31) 3319-7000', 'Belo Horizonte, MG', '21220299000121', NOW()),
    ('00000001-0000-0000-0000-000000000004', 'Instituicao Demo', 'contato@instituicao.com','$2a$10$fTecRd.YXPDk7K70zuNMyuyLAMSjtiyA2OXEULMBwDsYI.IyrDr4K',  '(31) 3000-0000', 'Belo Horizonte, MG', '00000000000100', NOW())
ON CONFLICT DO NOTHING;

INSERT INTO companies (id, nome_fantasia, cnpj, email, senha)
VALUES
    ('00000004-0000-0000-0000-000000000001', 'Empresa Demo',       '00000000000101', 'empresa@empresa.com',         '$2a$10$Siqunap5JQf4QtN4MmY.puJK9hFunBkCvCmRB7Cuiz2GfUnJCitgS'),
    ('00000004-0000-0000-0000-000000000002', 'Mercado Aurora',     '00000000000102', 'parceiro@mercadoaurora.com',  '$2a$10$Siqunap5JQf4QtN4MmY.puJK9hFunBkCvCmRB7Cuiz2GfUnJCitgS'),
    ('00000004-0000-0000-0000-000000000003', 'Sabor Central',      '00000000000103', 'parceiro@saborcentral.com',   '$2a$10$Siqunap5JQf4QtN4MmY.puJK9hFunBkCvCmRB7Cuiz2GfUnJCitgS'),
    ('00000004-0000-0000-0000-000000000004', 'Banco Prisma',       '00000000000104', 'parceiro@bancoprisma.com',    '$2a$10$Siqunap5JQf4QtN4MmY.puJK9hFunBkCvCmRB7Cuiz2GfUnJCitgS'),
    ('00000004-0000-0000-0000-000000000005', 'Loja Lume',          '00000000000105', 'parceiro@lojalume.com',       '$2a$10$Siqunap5JQf4QtN4MmY.puJK9hFunBkCvCmRB7Cuiz2GfUnJCitgS'),
    ('00000004-0000-0000-0000-000000000006', 'Mobilidade Vitta',   '00000000000106', 'parceiro@mobilidadevitta.com','$2a$10$Siqunap5JQf4QtN4MmY.puJK9hFunBkCvCmRB7Cuiz2GfUnJCitgS')
ON CONFLICT DO NOTHING;

INSERT INTO professors (id, nome, cpf, email, senha, institution_id, saldo_moedas, ultimo_aviso)
VALUES
    ('00000002-0000-0000-0000-000000000001', 'Prof. Carlos Mendes', NULL, 'professor@emoney.com', '$2a$10$qinCA5ZQtxIU97dZp2dI6OH2VrQ0/F6m06o4KiqkZO8gBv0Me9OYW', '00000001-0000-0000-0000-000000000001', 0, '')
ON CONFLICT DO NOTHING;

DELETE FROM professor_cursos
WHERE professor_id = '00000002-0000-0000-0000-000000000001'
  AND curso IN ('Engenharia de Software', 'Ciencia da Computacao');

INSERT INTO professor_cursos (professor_id, curso)
VALUES
    ('00000002-0000-0000-0000-000000000001', 'Engenharia de Software'),
    ('00000002-0000-0000-0000-000000000001', 'Ciencia da Computacao')
ON CONFLICT DO NOTHING;

INSERT INTO students (id, nome, email, cpf, rg, endereco, institution_id, instituicao, curso, senha, saldo_moedas, ultimo_aviso, criado_em)
VALUES
    ('00000005-0000-0000-0000-000000000002', 'Aluno Demo', 'aluno@aluno.com', '00000000002', '000000002', 'Belo Horizonte, MG', '00000001-0000-0000-0000-000000000001', 'PUC Minas', 'Engenharia de Software', '$2a$10$JuZGBbg1vrvdTyXU1WodK.pIw5dBz6YWLPMk9j1H/FY5jwZUBa8ne', 0, '', NOW())
ON CONFLICT DO NOTHING;

UPDATE products SET version = 0 WHERE version IS NULL;
UPDATE products SET ativo = TRUE WHERE ativo IS NULL;

INSERT INTO products (id, nome, empresa_parceira, descricao, custo_moedas, image_url, company_id, version)
VALUES
    ('00000003-0000-0000-0000-000000000001', 'Fundamentos da Arquitetura de Software', 'Editora Horizonte', 'Uma abordagem moderna para engenharia e arquitetura de software.',              180, '/assets/products/fundamentos-arquitetura-software.jpg', NULL,                                    0),
    ('00000003-0000-0000-0000-000000000002', 'Criando Microservicos',                  'Editora Horizonte', 'Projetando sistemas com componentes menores e mais especializados.',            170, '/assets/products/criando-microservicos.jpg',            NULL,                                    0),
    ('00000003-0000-0000-0000-000000000003', 'Programacao Utilizando IA',              'Empresa Demo',      'Otimizando planejamento, programacao, testes e implantacao com IA.',            150, '/assets/products/programacao-utilizando-ia.jpg',        '00000004-0000-0000-0000-000000000001', 0),
    ('00000003-0000-0000-0000-000000000004', 'Fluencia em Dados e IA',                 'Empresa Demo',      'Estrategias e praticas para trabalhar e viver em um mundo dirigido por dados.', 160, '/assets/products/fluencia-dados-ia.png',                '00000004-0000-0000-0000-000000000001', 0),
    ('00000003-0000-0000-0000-000000000005', 'Boca do Forno',                          'Empresa Demo',      'Voucher especial para usar em doces e salgados da Boca do Forno.',              80,  '/assets/products/boca-forno.png',                       '00000004-0000-0000-0000-000000000001', 0),
    ('00000003-0000-0000-0000-000000000006', 'Desconto de Mensalidade',                'Empresa Demo',      'Credito simbolico para abatimento em mensalidade academica.',                    500, '/assets/products/mensalidade.svg',                      '00000004-0000-0000-0000-000000000001', 0)
ON CONFLICT DO NOTHING;

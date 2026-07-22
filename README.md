# TolkienCraft.blog

<<<<<<< HEAD
Portal TolkienCraft desenvolvido em HTML5, CSS3 e JavaScript modular, com back-end Node.js/Express, autenticação administrativa, MySQL e CMS completo de publicações.

## Recursos principais

- Site público responsivo preservando a identidade visual original.
- Login administrativo protegido por sessão persistida no MySQL.
- CRUD completo de publicações.
- Publicação imediata e salvamento como rascunho.
- Pesquisa, filtro por status e ordenação no painel.
- Editor em blocos sem bibliotecas pesadas.
- Upload de imagens e arquivos com persistência em volume Docker.
- Índice automático gerado a partir dos blocos do tipo **Título**.
- Numeração automática das seções.
- Navegação automática entre publicação anterior e próxima.
- URLs amigáveis no formato `/publicacoes/slug-da-publicacao`.
- SEO por publicação: title, description, keywords e Open Graph.
- Sitemap XML dinâmico.
- phpMyAdmin disponível apenas na máquina local.

## Estrutura do projeto

```text
tolkiencraft.blog/
├── assets/
│   ├── icons/
│   ├── images/
│   └── uploads/
│       ├── files/
│       └── images/
├── config/
├── controllers/
├── data/
├── database/
├── functions/
├── js/
│   ├── adm/
│   │   └── cms/
│   └── pages/
├── middleware/
├── models/
├── pages/
├── routes/
├── services/
├── styles/
├── utils/
├── views/
│   ├── adm/
│   └── publications/
├── app.js
├── server.js
├── Dockerfile
└── docker-compose.yml
```

## Inicialização com Docker

Na pasta que contém `docker-compose.yml`, execute:

```bash
docker compose up -d --build
```

Acompanhe a inicialização:

```bash
docker compose logs -f app
```

Verifique os serviços:

```bash
docker compose ps
```

## Endereços locais

| Serviço | Endereço |
|---|---|
| Site público | http://localhost:3000 |
| Login administrativo | http://localhost:3000/adm/login |
| Painel administrativo | http://localhost:3000/adm/dashboard |
| Gerenciar publicações | http://localhost:3000/adm/publicacoes |
| phpMyAdmin | http://localhost:8080 |
| Health check | http://localhost:3000/health |

## Credenciais locais iniciais

### Painel administrativo

```text
Email: Mattheaus.hoffman@gmail.com
Senha: Matth)19052005
```

### phpMyAdmin

```text
Usuário: tolkiencraft
Senha: local-app-password
Servidor interno: mysql
```

Também é possível entrar como root:

```text
Usuário: root
Senha: local-root-password
```

As credenciais acima existem somente para desenvolvimento local. Troque todas elas antes de publicar o sistema.

## Banco de dados

O banco `admin_system` e as tabelas são criados automaticamente na inicialização.

### Tabelas

- `admins`: administradores autorizados.
- `sessions`: sessões autenticadas.
- `publications`: metadados, status, SEO, ordem e navegação das publicações.
- `publication_blocks`: blocos estruturados vinculados às publicações.
- `media_files`: arquivos enviados pelo painel.

As publicações existentes no projeto são migradas automaticamente como dados iniciais na primeira execução:

- Código de Guerra dos Reinos.
- Sistema de Terrenos do Servidor.
- Calendário de Eventos da Primeira Era.
- Regras Gerais do Servidor.

O processo de seed é idempotente e não duplica publicações já existentes.

## Editor em blocos

O CMS oferece os seguintes blocos:

- Título.
- Subtítulo.
- Texto.
- Parágrafo.
- Lista.
- Lista numerada.
- Citação.
- Imagem.
- Galeria.
- Link.
- Botão.
- Código.
- Tabela.
- Aviso.
- Destaque.
- Separador.
- Vídeo.
- Download de arquivo.

Os blocos podem ser movidos para cima ou para baixo, recolhidos para edição e excluídos. A posição salva no banco define a ordem pública.

### Títulos e índice

Cada bloco do tipo **Título** inicia automaticamente uma nova seção pública. A numeração e o índice são gerados durante a renderização:

```text
1. Introdução
2. Instalação
3. Configuração
```

A remoção ou reorganização dos títulos atualiza o índice sem intervenção manual.

## Publicações públicas

As listas da página inicial e de `/pages/publicacoes.html` consomem a API pública:

```text
GET /api/publicacoes
GET /api/publicacoes/:slug
```

A página completa é renderizada no servidor:

```text
GET /publicacoes/:slug
```

Rascunhos nunca são retornados pela API pública e não podem ser acessados por URL pública.

## API administrativa

Todas as rotas abaixo exigem sessão de administrador:

```text
GET    /api/admin/publicacoes
GET    /api/admin/publicacoes/:id
POST   /api/admin/publicacoes
PUT    /api/admin/publicacoes/:id
DELETE /api/admin/publicacoes/:id
POST   /api/admin/uploads
```

Operações de escrita também exigem token CSRF.

## Segurança implementada

- Hash de senha com bcrypt.
- Sessão armazenada no MySQL.
- Cookie HttpOnly e SameSite Strict.
- Regeneração da sessão após login.
- Proteção CSRF nas operações de escrita.
- Rate limit no login.
- Consultas MySQL parametrizadas.
- Sanitização do HTML rico no servidor.
- Restrição de tipos e tamanho de upload.
- Bloqueio de SVG, HTML e scripts em uploads.
- Content Security Policy com Helmet.
- Rotas administrativas protegidas por Auth Guard.
- Exclusão com confirmação explícita.

## Persistência Docker

O Compose utiliza dois volumes:

```text
tolkiencraft_mysql_data
tolkiencraft_uploads
```

O primeiro mantém o banco MySQL. O segundo mantém imagens e arquivos enviados pelo CMS.

Para parar sem apagar dados:

```bash
docker compose down
```

Para apagar completamente banco e uploads locais:
=======
Portal em HTML5, CSS3 e JavaScript ES Modules, integrado a um back-end Node.js com Express e MySQL para autenticação exclusiva de administradores.

## Recursos preservados

- Página inicial, publicações, reinos, mapa, eventos, regras e comunidade.
- CSS modular e responsivo.
- Filtros de reinos, accordions, modal do mapa, cópia do IP e status do servidor.
- Mesma identidade visual e os mesmos componentes do projeto anterior.

## Autenticação administrativa

- Login exclusivo, sem cadastro e sem recuperação de senha.
- Rota pública: `/adm/login`.
- Rota protegida: `/adm/dashboard`.
- Sessão persistida em MySQL com cookie `HttpOnly` e `SameSite=Strict`.
- Hash bcrypt com custo configurável.
- Consultas parametrizadas por `mysql2`.
- Proteção contra fixação de sessão, CSRF e tentativas repetidas de login.
- Logout com destruição da sessão e remoção do cookie.
- Páginas administrativas com `noindex`, cache desativado e proteção no servidor.

## Estrutura

```text
tolkiencraft.blog/
├── app.js
├── server.js
├── package.json
├── docker-compose.yml
├── Dockerfile
├── config/
├── database/
├── models/
├── services/
├── controllers/
├── middleware/
├── routes/
├── utils/
├── views/adm/
├── index.html
├── pages/
├── styles/
├── js/
├── functions/
├── data/
└── assets/
```

## Execução completa com Docker

O modo mais simples inicializa a aplicação e o MySQL já configurados:

```bash
docker compose up --build
```

Acesse:

- Site: `http://localhost:3000`
- Login administrativo: `http://localhost:3000/adm/login`

O banco `admin_system`, as tabelas `admins` e `sessions` e o administrador padrão são criados automaticamente na primeira execução. A senha é convertida para bcrypt no servidor antes da inserção.

Para zerar completamente o banco local do Docker:
>>>>>>> 980f02e005ec0054436948c190aa1947f401cb2e

```bash
docker compose down -v
```

<<<<<<< HEAD
Atenção: o segundo comando remove todos os dados persistidos do ambiente local.

## Execução sem Docker

É necessário ter Node.js 22 ou superior e MySQL 8 instalado.

```bash
npm install
npm start
```

Configure as variáveis a partir de `.env.example` e garanta que o usuário informado tenha permissão para criar e utilizar o banco.

## Validação do código

```bash
npm run check
```

O comando verifica a sintaxe de todos os arquivos JavaScript do projeto.

## Produção

Antes da implantação:

1. Altere `DEFAULT_ADMIN_PASSWORD`.
2. Altere `MYSQL_ROOT_PASSWORD` e `MYSQL_PASSWORD`.
3. Defina um `SESSION_SECRET` aleatório com pelo menos 32 caracteres.
4. Configure `SITE_URL` com o domínio HTTPS definitivo.
5. Use `NODE_ENV=production`.
6. Defina `SESSION_COOKIE_SECURE=true`.
7. Não exponha o phpMyAdmin publicamente.
8. Armazene segredos em variáveis de ambiente, nunca no repositório.


## CMS de Reinos

O Painel Administrativo possui um módulo protegido em `/adm/reinos` para criar, editar, excluir, ativar, desativar e ordenar Reinos. A página pública `/pages/reinos.html` consome exclusivamente a API `/api/reinos`; o antigo arquivo de dados mockados foi removido.

A tabela `reinos` armazena nome e slug únicos, imagem opcional, status `active` ou `inactive`, raças, liderança, descrição limitada a 100 caracteres, ordem de exibição e datas de auditoria. Os registros iniciais são carregados de forma idempotente por `data/seed-kingdoms.js`.

Rotas administrativas protegidas:

- `/adm/reinos`
- `/adm/reinos/novo`
- `/adm/reinos/:id/editar`
- `/api/admin/reinos`

Rotas públicas:

- `/api/reinos`
- `/api/reinos/:slug`
- `/reinos/:slug` (redireciona para o card correspondente na página pública)
=======
## Execução com MySQL já instalado

1. Use Node.js 22 ou superior e MySQL 8.4 ou compatível.
2. Copie `.env.example` para `.env` e ajuste as credenciais do MySQL.
3. Instale as dependências e execute:

```bash
npm install
npm run db:init
npm start
```

O comando `npm run db:init` é idempotente. Também é executado automaticamente no início da aplicação.

## Segurança para produção

- Troque imediatamente `SESSION_SECRET`, senhas do MySQL e a credencial administrativa padrão.
- Publique apenas por HTTPS.
- Use `NODE_ENV=production` e `SESSION_COOKIE_SECURE=true`.
- Não versione o arquivo `.env`.
- Mantenha as dependências atualizadas e execute auditorias periódicas com `npm audit`.
- Restrinja o usuário do MySQL ao banco `admin_system`.

## Banco de dados

O arquivo `database/schema.sql` contém a estrutura completa e uma inserção alternativa do administrador com senha já convertida para bcrypt. A inicialização normal utiliza `database/bootstrap.js`, que gera um hash novo e seguro na primeira execução.
>>>>>>> 980f02e005ec0054436948c190aa1947f401cb2e

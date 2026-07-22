# TolkienCraft.blog

<<<<<<< HEAD
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
=======
Projeto estático em HTML5, CSS3 e JavaScript ES Modules, inspirado no conteúdo público do TolkienCraft e reorganizado como portal de servidor.

## Execução local

Como o projeto usa módulos JavaScript, não abra apenas o arquivo `index.html` com `file://`.

Na pasta do projeto, execute uma destas opções:

```bash
python -m http.server 8000
```

ou:

```bash
npx serve .
```

Depois acesse `http://localhost:8000`.
>>>>>>> b7fd263d62bc71e1045bb61d461b02928a56dbef

## Estrutura

```text
tolkiencraft.blog/
<<<<<<< HEAD
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

```bash
docker compose down -v
```

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
=======
├── index.html
├── pages/
│   ├── como-jogar.html
│   ├── comunidade.html
│   ├── eventos.html
│   ├── mapa.html
│   ├── publicacoes.html
│   ├── regras.html
│   ├── reinos.html
│   └── posts/
│       ├── codigo-guerra.html
│       └── sistema-terrenos.html
├── styles/
│   ├── reset.css
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── pages.css
│   └── responsive.css
├── js/
│   ├── config.js
│   ├── main.js
│   └── pages/
├── data/
│   ├── events.js
│   ├── kingdoms.js
│   └── rules.js
├── functions/
└── assets/
```

## Conteúdo centralizado

- Endereço, versões e canais: `js/config.js`
- Reinos: `data/kingdoms.js`
- Calendário: `data/events.js`
- Regulamento com 15 tópicos: `data/rules.js`

## Correções incorporadas

- Área de publicações na página inicial.
- Página de listagem de publicações.
- Página completa do Código de Guerra dos Reinos.
- Página completa do Sistema de Terrenos.
- Regulamento geral ampliado para 15 tópicos.
- Calendário completo de junho a dezembro.
- Tipografia compacta para os nomes dos meses.
- Filtros de reinos corrigidos, incluindo normalização de acentos e contador de resultados.

## Publicação

Antes de publicar:

1. Atualize os dados oficiais em `js/config.js`.
2. Troque `https://seudominio.com` no `sitemap.xml`.
3. Execute o site por servidor HTTP e teste em desktop e mobile.
4. Comprima imagens adicionais antes de incluí-las.
>>>>>>> b7fd263d62bc71e1045bb61d461b02928a56dbef

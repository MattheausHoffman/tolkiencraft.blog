# TolkienCraft.blog

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

## Estrutura

```text
tolkiencraft.blog/
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

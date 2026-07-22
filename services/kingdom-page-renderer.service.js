import { env } from '../config/environment.js';
import { buildSections, renderBlock } from './publication-renderer.service.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function statusLabel(status) {
  return status === 'active' ? 'Ativo' : 'Inativo';
}

function renderPagination(page) {
  const previous = page.previousKingdom
    ? `<a class="article-pagination__item" href="/reinos/${escapeHtml(page.previousKingdom.slug)}"><span>Reino anterior</span><strong>${escapeHtml(page.previousKingdom.nome)}</strong></a>`
    : '<span></span>';
  const next = page.nextKingdom
    ? `<a class="article-pagination__item article-pagination__item--next" href="/reinos/${escapeHtml(page.nextKingdom.slug)}"><span>Próximo Reino</span><strong>${escapeHtml(page.nextKingdom.nome)}</strong></a>`
    : '';
  if (!page.previousKingdom && !page.nextKingdom) return '';
  return `<nav class="article-pagination" aria-label="Navegação entre Reinos">${previous}${next}</nav>`;
}

export function renderKingdomPage(page) {
  const kingdom = page.kingdom;
  const { preface, sections } = buildSections(page.blocks || []);
  const index = sections.length
    ? `<aside class="article-index kingdom-page__index" aria-label="Índice do Reino"><strong>Neste Reino</strong><ol>${sections.map((section) => `<li><a href="#${section.id}">${section.number}. ${escapeHtml(section.title)}</a></li>`).join('')}</ol></aside>`
    : '';
  const body = `${preface.map(renderBlock).join('')}${sections.map((section) => `<section id="${section.id}" class="publication-section kingdom-page__section"><h2><span>${section.number}.</span> ${escapeHtml(section.title)}</h2>${section.blocks.map(renderBlock).join('')}</section>`).join('')}${renderPagination(page)}`;
  const title = page.seoTitle || `${kingdom.nome} | Reinos | TolkienCraft`;
  const description = page.metaDescription || kingdom.descricao;
  const ogTitle = page.ogTitle || kingdom.nome;
  const ogDescription = page.ogDescription || description;
  const rawOgImage = page.ogImageUrl || kingdom.imagem || '/assets/images/hero.png';
  const ogImage = rawOgImage.startsWith('/') ? `${env.siteUrl}${rawOgImage}` : rawOgImage;
  const canonical = `${env.siteUrl}/reinos/${kingdom.slug}`;

  return `<!DOCTYPE html>
<html lang="pt-BR" data-base="/">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0c120d">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/styles/reset.css">
  <link rel="stylesheet" href="/styles/tokens.css">
  <link rel="stylesheet" href="/styles/base.css">
  <link rel="stylesheet" href="/styles/layout.css">
  <link rel="stylesheet" href="/styles/components.css">
  <link rel="stylesheet" href="/styles/pages.css">
  <link rel="stylesheet" href="/styles/responsive.css">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${page.metaKeywords ? `<meta name="keywords" content="${escapeHtml(page.metaKeywords)}">` : ''}
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDescription)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
</head>
<body data-page="reinos" class="kingdom-detail-page">
  <header class="site-header" data-site-header></header>
  <main id="conteudo">
    <article class="article-page kingdom-page">
      <header class="article-hero kingdom-page__hero">
        <div class="container">
          <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/index.html">Início</a><span aria-hidden="true">/</span><a href="/pages/reinos.html">Reinos</a><span aria-hidden="true">/</span><span>${escapeHtml(kingdom.nome)}</span></nav>
          <p class="eyebrow">Reino de Beleriand</p>
          <h1>${escapeHtml(kingdom.nome)}</h1>
          <p class="lead">${escapeHtml(kingdom.descricao)}</p>
        </div>
      </header>
      ${kingdom.imagem ? `<figure class="kingdom-page__banner"><img src="${escapeHtml(kingdom.imagem)}" alt="Banner do Reino ${escapeHtml(kingdom.nome)}"></figure>` : ''}
      <section class="container kingdom-page__facts" aria-label="Informações do Reino">
        <div><span>Status</span><strong class="status-badge status-badge--${escapeHtml(kingdom.status)}">${statusLabel(kingdom.status)}</strong></div>
        <div><span>Liderança</span><strong>${escapeHtml(kingdom.lideranca)}</strong></div>
        <div><span>Raças</span><strong>${escapeHtml(kingdom.racas)}</strong></div>
      </section>
      <div class="container article-layout kingdom-page__layout ${sections.length ? '' : 'article-layout--without-index'}">
        ${index}
        <div class="article-content kingdom-page__content">${body}</div>
      </div>
    </article>
  </main>
  <footer class="footer" data-site-footer></footer>
  <script type="module" src="/js/main.js"></script>
</body>
</html>`;
}

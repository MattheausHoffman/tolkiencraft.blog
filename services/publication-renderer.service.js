import { env } from '../config/environment.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function slugFragment(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'secao';
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Recife'
  }).format(new Date(value));
}

function externalAttributes(data) {
  return data.newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
}

function renderList(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((item) => `<li>${item}</li>`).join('')}</${tag}>`;
}

function renderBlock(block) {
  const data = block.data || {};
  switch (block.type) {
    case 'subtitle':
      return `<h3>${escapeHtml(data.text)}</h3>`;
    case 'text':
      return `<div class="publication-rich-text">${data.html || ''}</div>`;
    case 'paragraph':
      return `<div class="publication-paragraph">${data.html || ''}</div>`;
    case 'list':
      return renderList(data.items || [], false);
    case 'ordered_list':
      return renderList(data.items || [], true);
    case 'quote':
      return `<blockquote class="publication-quote"><div>${data.html || ''}</div>${data.cite ? `<cite>${escapeHtml(data.cite)}</cite>` : ''}</blockquote>`;
    case 'image': {
      const width = Math.round((Number(data.width) || 100) / 10) * 10;
      const safeWidth = Math.min(Math.max(width, 10), 100);
      return `<figure class="publication-image publication-image--${escapeHtml(data.alignment || 'left')} publication-image--w${safeWidth}"><img src="${escapeHtml(data.url)}" alt="${escapeHtml(data.alt)}" loading="lazy">${data.caption ? `<figcaption>${escapeHtml(data.caption)}</figcaption>` : ''}</figure>`;
    }
    case 'gallery':
      return `<div class="publication-gallery publication-gallery--${Math.min(Math.max(Number(data.columns) || 2, 1), 4)}">${(data.images || []).map((image) => `<figure><img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt)}" loading="lazy">${image.caption ? `<figcaption>${escapeHtml(image.caption)}</figcaption>` : ''}</figure>`).join('')}</div>`;
    case 'link':
      return `<p class="publication-link"><a href="${escapeHtml(data.url)}"${externalAttributes(data)}>${escapeHtml(data.text || data.url)}</a></p>`;
    case 'button': {
      const variant = data.style === 'secondary' ? ' button--secondary' : data.style === 'ghost' ? ' button--ghost' : '';
      return `<p class="publication-button"><a class="button${variant}" href="${escapeHtml(data.url)}"${externalAttributes(data)}>${escapeHtml(data.text || 'Acessar')}</a></p>`;
    }
    case 'code':
      return `<div class="publication-code">${data.language ? `<span>${escapeHtml(data.language)}</span>` : ''}<pre><code>${escapeHtml(data.code)}</code></pre></div>`;
    case 'table': {
      const header = data.hasHeader ? `<thead><tr>${(data.headers || []).map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead>` : '';
      const body = `<tbody>${(data.rows || []).map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>`;
      return `<div class="table-wrap publication-table publication-table--${escapeHtml(data.alignment || 'left')}"><table>${header}${body}</table></div>`;
    }
    case 'notice':
      return `<div class="notice"><strong>${escapeHtml(data.heading || 'Aviso')}</strong><div>${data.html || ''}</div></div>`;
    case 'highlight':
      return `<div class="publication-highlight"><strong>${escapeHtml(data.heading || 'Destaque')}</strong><div>${data.html || ''}</div></div>`;
    case 'separator':
      return '<hr class="publication-separator">';
    case 'video':
      return data.url ? `<figure class="publication-video"><div><iframe src="${escapeHtml(data.url)}" title="${escapeHtml(data.title || 'Vídeo da publicação')}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>${data.caption ? `<figcaption>${escapeHtml(data.caption)}</figcaption>` : ''}</figure>` : '';
    case 'download':
      return data.url ? `<a class="publication-download" href="${escapeHtml(data.url)}" download><span aria-hidden="true">↓</span><span><strong>${escapeHtml(data.label || 'Baixar arquivo')}</strong>${data.description ? `<small>${escapeHtml(data.description)}</small>` : ''}</span></a>` : '';
    default:
      return '';
  }
}

function buildSections(blocks) {
  const preface = [];
  const sections = [];
  let current = null;
  let titleNumber = 0;

  for (const block of blocks) {
    if (block.type === 'title') {
      titleNumber += 1;
      current = {
        number: titleNumber,
        title: block.data?.text || `Seção ${titleNumber}`,
        id: `secao-${titleNumber}-${slugFragment(block.data?.text)}`,
        blocks: []
      };
      sections.push(current);
      continue;
    }
    if (current) current.blocks.push(block);
    else preface.push(block);
  }

  return { preface, sections };
}

function renderPagination(publication) {
  if (!publication.previousPublication && !publication.nextPublication) return '';
  const previous = publication.previousPublication ? `<a class="article-pagination__item" href="/publicacoes/${escapeHtml(publication.previousPublication.slug)}"><span>Publicação anterior</span><strong>${escapeHtml(publication.previousPublication.title)}</strong></a>` : '<span></span>';
  const next = publication.nextPublication ? `<a class="article-pagination__item article-pagination__item--next" href="/publicacoes/${escapeHtml(publication.nextPublication.slug)}"><span>Próxima publicação</span><strong>${escapeHtml(publication.nextPublication.title)}</strong></a>` : '';
  return `<nav class="article-pagination" aria-label="Navegação entre publicações">${previous}${next}</nav>`;
}

export function renderPublicationPage(publication) {
  const { preface, sections } = buildSections(publication.blocks || []);
  const index = sections.length ? `<aside class="article-index" aria-label="Índice da publicação"><strong>Nesta publicação</strong><ol>${sections.map((section) => `<li><a href="#${section.id}">${section.number}. ${escapeHtml(section.title)}</a></li>`).join('')}</ol></aside>` : '';
  const body = `${preface.map(renderBlock).join('')}${sections.map((section) => `<section id="${section.id}" class="publication-section"><h2><span>${section.number}.</span> ${escapeHtml(section.title)}</h2>${section.blocks.map(renderBlock).join('')}</section>`).join('')}${renderPagination(publication)}`;
  const title = publication.seoTitle || `${publication.title} | TolkienCraft`;
  const description = publication.metaDescription || publication.summary;
  const ogTitle = publication.ogTitle || publication.title;
  const ogDescription = publication.ogDescription || description;
  const rawOgImage = publication.ogImageUrl || publication.coverImageUrl || '/assets/images/hero.png';
  const ogImage = rawOgImage.startsWith('/') ? `${env.siteUrl}${rawOgImage}` : rawOgImage;
  const canonicalPath = `/publicacoes/${publication.slug}`;
  const canonical = `${env.siteUrl}${canonicalPath}`;

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
  ${publication.metaKeywords ? `<meta name="keywords" content="${escapeHtml(publication.metaKeywords)}">` : ''}
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDescription)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
</head>
<body data-page="publicacoes">
  <header class="site-header" data-site-header></header>
  <main id="conteudo">
    <article class="article-page">
      <header class="article-hero">
        <div class="container">
          <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/index.html">Início</a><span aria-hidden="true">/</span><a href="/pages/publicacoes.html">Publicações</a><span aria-hidden="true">/</span><span>${escapeHtml(publication.title)}</span></nav>
          <p class="eyebrow">Publicação oficial</p>
          <h1>${escapeHtml(publication.title)}</h1>
          <p class="lead">${escapeHtml(publication.summary)}</p>
          <div class="article-meta"><time datetime="${escapeHtml(new Date(publication.publishedAt || publication.createdAt).toISOString())}">${escapeHtml(formatDate(publication.publishedAt || publication.createdAt))}</time><span>${sections.length} ${sections.length === 1 ? 'seção' : 'seções'}</span><span>Por ${escapeHtml(publication.author)}</span></div>
        </div>
      </header>
      ${publication.coverImageUrl ? `<figure class="article-cover"><img src="${escapeHtml(publication.coverImageUrl)}" alt="${escapeHtml(publication.coverImageAlt || '')}"></figure>` : ''}
      <div class="container article-layout ${sections.length ? '' : 'article-layout--without-index'}">
        ${index}
        <div class="article-content">${body}</div>
      </div>
    </article>
  </main>
  <footer class="footer" data-site-footer></footer>
  <script type="module" src="/js/main.js"></script>
</body>
</html>`;
}

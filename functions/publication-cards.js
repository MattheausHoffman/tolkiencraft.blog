function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(new Date(value));
}

export function publicationCardMarkup(publication, { headingLevel = 2 } = {}) {
  const heading = headingLevel === 3 ? 'h3' : 'h2';
  const url = `/publicacoes/${encodeURIComponent(publication.slug)}`;
  const cover = publication.coverImageUrl || '/assets/images/hero.png';
  const alt = publication.coverImageAlt || '';
  return `
    <article class="post-card">
      <a class="post-card__image" href="${url}"><img src="${escapeHtml(cover)}" alt="${escapeHtml(alt)}" loading="lazy"></a>
      <div class="post-card__body">
        <p class="eyebrow">${publication.status === 'draft' ? 'Rascunho' : 'Publicação oficial'}</p>
        <${heading}><a href="${url}">${escapeHtml(publication.title)}</a></${heading}>
        <p>${escapeHtml(publication.summary)}</p>
        <div class="post-card__meta"><span>${escapeHtml(publication.author)}</span><time>${escapeHtml(formatDate(publication.publishedAt || publication.createdAt))}</time></div>
        <a class="text-link" href="${url}">Ler publicação completa</a>
      </div>
    </article>`;
}

export async function renderPublicationCards(container, { limit = 100, headingLevel = 2 } = {}) {
  if (!container) return;
  container.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch(`/api/publicacoes?limit=${encodeURIComponent(limit)}&sort=order_asc`, {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('Não foi possível carregar as publicações.');
    const data = await response.json();
    const publications = data.publications || [];
    container.innerHTML = publications.length
      ? publications.map((publication) => publicationCardMarkup(publication, { headingLevel })).join('')
      : '<p class="empty-state">Nenhuma publicação disponível no momento.</p>';
  } catch (error) {
    container.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  } finally {
    container.removeAttribute('aria-busy');
  }
}

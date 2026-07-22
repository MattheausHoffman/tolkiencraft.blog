import { bindFilterButtons } from '../../functions/filters.js';
import { escapeHTML } from '../../functions/utilities.js';

function statusLabel(status) {
  return status === 'active' ? 'Ativo' : 'Inativo';
}

function kingdomCard(kingdom) {
  const searchable = `${kingdom.racas} ${kingdom.status}`;
  const image = kingdom.imagem
    ? `<figure class="kingdom-card__image"><img src="${escapeHTML(kingdom.imagem)}" alt="Reino ${escapeHTML(kingdom.nome)}" loading="lazy" decoding="async"></figure>`
    : '';

  return `
    <article id="${escapeHTML(kingdom.slug)}" class="kingdom-card" data-kingdom data-filter-value="${escapeHTML(searchable)}">
      ${image}
      <header class="kingdom-card__header">
        <div>
          <p class="eyebrow">Reino de Beleriand</p>
          <h2>${escapeHTML(kingdom.nome)}</h2>
        </div>
        <span class="status-badge status-badge--${kingdom.status}">${statusLabel(kingdom.status)}</span>
      </header>
      <dl class="definition-list">
        <div><dt>Raça</dt><dd>${escapeHTML(kingdom.racas)}</dd></div>
        <div><dt>Liderança</dt><dd>${escapeHTML(kingdom.lideranca)}</dd></div>
      </dl>
      <p>${escapeHTML(kingdom.descricao)}</p>
    </article>`;
}

export async function initKingdomsPage() {
  const grid = document.querySelector('[data-kingdom-grid]');
  const resultCount = document.querySelector('[data-filter-result]');
  if (!grid) return;

  grid.innerHTML = '<p class="empty-state">Carregando Reinos...</p>';

  try {
    const response = await fetch('/api/reinos?sort=order_asc&limit=500', {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('Não foi possível carregar os Reinos.');
    const data = await response.json();
    const kingdoms = data.kingdoms || [];

    grid.innerHTML = kingdoms.length
      ? kingdoms.map(kingdomCard).join('')
      : '<p class="empty-state">Nenhum Reino cadastrado.</p>';

    if (!kingdoms.length) {
      if (resultCount) resultCount.textContent = '0 Reinos exibidos';
      return;
    }

    bindFilterButtons({
      buttonSelector: '[data-filter]',
      itemSelector: '[data-kingdom]',
      getValue: (item) => item.dataset.filterValue || '',
      onChange: ({ visibleCount, totalCount }) => {
        if (resultCount) resultCount.textContent = `${visibleCount} de ${totalCount} Reinos exibidos`;
      }
    });


    const targetSlug = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (targetSlug) {
      window.requestAnimationFrame(() => {
        document.getElementById(targetSlug)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  } catch (error) {
    grid.innerHTML = '<p class="empty-state">Não foi possível carregar os Reinos neste momento.</p>';
    if (resultCount) resultCount.textContent = '';
    console.error(error);
  }
}

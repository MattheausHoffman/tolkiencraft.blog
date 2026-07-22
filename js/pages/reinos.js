import { KINGDOMS } from '../../data/kingdoms.js';
import { bindFilterButtons } from '../../functions/filters.js';
import { escapeHTML } from '../../functions/utilities.js';

export function initKingdomsPage() {
  const grid = document.querySelector('[data-kingdom-grid]');
  const resultCount = document.querySelector('[data-filter-result]');
  if (!grid) return;

  grid.innerHTML = KINGDOMS.map((kingdom) => {
    const statusLabel = kingdom.status === 'active' ? 'Ativo' : 'Recrutando';
    const searchable = `${kingdom.race} ${kingdom.status}`;
    return `
      <article class="kingdom-card" data-kingdom data-filter-value="${escapeHTML(searchable)}">
        <header class="kingdom-card__header">
          <div>
            <p class="eyebrow">Reino de Beleriand</p>
            <h2>${escapeHTML(kingdom.name)}</h2>
          </div>
          <span class="status-badge status-badge--${kingdom.status}">${statusLabel}</span>
        </header>
        <dl class="definition-list">
          <div><dt>Raça</dt><dd>${escapeHTML(kingdom.race)}</dd></div>
          <div><dt>Liderança</dt><dd>${escapeHTML(kingdom.leader)}</dd></div>
        </dl>
        <p>${escapeHTML(kingdom.region)}</p>
      </article>`;
  }).join('');

  bindFilterButtons({
    buttonSelector: '[data-filter]',
    itemSelector: '[data-kingdom]',
    getValue: (item) => item.dataset.filterValue || '',
    onChange: ({ visibleCount, totalCount }) => {
      if (resultCount) resultCount.textContent = `${visibleCount} de ${totalCount} reinos exibidos`;
    }
  });
}

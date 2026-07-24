import { bindAccordions } from '../../functions/accordion.js';
import { escapeHTML } from '../../functions/utilities.js';

function renderSection(section) {
  return `
    <section class="rule-section">
      <h3>${escapeHTML(section.title)}</h3>
      <ul>${section.items.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
    </section>`;
}

export function renderRules(rules) {
  if (!rules.length) {
    return `
      <article class="accordion-item">
        <div class="accordion-panel rule-empty-state">
          <p class="rule-summary">Não há regras cadastradas até o momento.</p>
        </div>
      </article>`;
  }

  return rules.map((rule, index) => {
    const panelId = `rule-panel-${rule.id || index + 1}`;
    return `
      <article class="accordion-item">
        <h2>
          <button class="accordion-button" type="button" data-accordion-button aria-expanded="${index === 0}" aria-controls="${panelId}">
            <span><small>Regra ${String(index + 1).padStart(2, '0')}</small>${escapeHTML(rule.titulo)}</span>
            <span class="accordion-icon" aria-hidden="true">+</span>
          </button>
        </h2>
        <div id="${panelId}" class="accordion-panel" ${index === 0 ? '' : 'hidden'}>
          <p class="rule-summary">${escapeHTML(rule.descricao)}</p>
          ${rule.sections.length ? `<div class="rule-sections">${rule.sections.map(renderSection).join('')}</div>` : ''}
        </div>
      </article>`;
  }).join('');
}

export async function initRulesPage() {
  const list = document.querySelector('[data-rules-list]');
  const count = document.querySelector('[data-rule-count]');
  const countLabel = document.querySelector('[data-rule-count-label]');
  if (!list) return;

  list.setAttribute('aria-busy', 'true');
  list.innerHTML = '<article class="accordion-item"><div class="accordion-panel rule-empty-state"><p class="rule-summary">Carregando Regras...</p></div></article>';

  try {
    const response = await fetch('/api/regras?sort=order_asc&limit=500', {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('Não foi possível carregar as Regras.');
    const data = await response.json();
    const rules = data.rules || [];
    list.innerHTML = renderRules(rules);
    if (count) count.textContent = String(rules.length);
    if (countLabel) countLabel.textContent = rules.length === 1 ? 'Tópico oficial' : 'Tópicos oficiais';
    if (rules.length) bindAccordions(list);
  } catch (error) {
    list.innerHTML = '<article class="accordion-item"><div class="accordion-panel rule-empty-state"><p class="rule-summary">Não foi possível carregar as Regras neste momento.</p></div></article>';
    if (count) count.textContent = '—';
    console.error(error);
  } finally {
    list.removeAttribute('aria-busy');
  }
}

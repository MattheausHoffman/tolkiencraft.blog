import { RULE_GROUPS } from '../../data/rules.js';
import { bindAccordions } from '../../functions/accordion.js';
import { escapeHTML } from '../../functions/utilities.js';

function renderSection(section) {
  return `
    <section class="rule-section">
      <h3>${escapeHTML(section.title)}</h3>
      <ul>${section.items.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
    </section>`;
}

export function initRulesPage() {
  const list = document.querySelector('[data-rules-list]');
  if (!list) return;

  list.innerHTML = RULE_GROUPS.map((group, index) => {
    const panelId = `rule-panel-${index + 1}`;
    return `
      <article class="accordion-item">
        <h2>
          <button class="accordion-button" type="button" data-accordion-button aria-expanded="${index === 0}" aria-controls="${panelId}">
            <span><small>Regra ${String(index + 1).padStart(2, '0')}</small>${escapeHTML(group.title)}</span>
            <span class="accordion-icon" aria-hidden="true">+</span>
          </button>
        </h2>
        <div id="${panelId}" class="accordion-panel" ${index === 0 ? '' : 'hidden'}>
          <p class="rule-summary">${escapeHTML(group.summary)}</p>
          <div class="rule-sections">${group.sections.map(renderSection).join('')}</div>
        </div>
      </article>`;
  }).join('');

  bindAccordions(list);
}

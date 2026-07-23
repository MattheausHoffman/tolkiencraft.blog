import { escapeHTML } from '../../functions/utilities.js';
import {
  EVENT_MONTHS,
  eventMonthSlug,
  formatEventDate
} from '../event-format.js';

function eventItem(event) {
  return `
    <article class="timeline-item">
      <time>${escapeHTML(formatEventDate(event))}</time>
      <div><h3>${escapeHTML(event.nome)}</h3><p>${escapeHTML(event.descricao || '')}</p></div>
    </article>`;
}

export function renderTimeline(events) {
  if (!events.length) {
    return `
      <article class="timeline-item timeline-item--empty">
        <div><h3>Não há eventos registrados até o momento.</h3></div>
      </article>`;
  }

  const grouped = events.reduce((months, event) => {
    (months[event.mes] ||= []).push(event);
    return months;
  }, {});

  return EVENT_MONTHS.map((month, index) => ({
    month,
    monthNumber: index + 1,
    monthEvents: grouped[index + 1] || []
  })).filter(({ monthEvents }) => monthEvents.length > 0).map(({ month, monthNumber, monthEvents }) => {
    const monthId = `month-${eventMonthSlug(monthNumber)}`;
    return `
      <section class="timeline-month" aria-labelledby="${monthId}">
        <h2 id="${monthId}">${escapeHTML(month)}</h2>
        <div class="timeline-list">
          ${monthEvents.map(eventItem).join('')}
        </div>
      </section>`;
  }).join('');
}

export async function initEventsPage() {
  const timeline = document.querySelector('[data-event-timeline]');
  if (!timeline) return;

  timeline.setAttribute('aria-busy', 'true');
  timeline.innerHTML = '<article class="timeline-item timeline-item--empty"><div><h3>Carregando Eventos...</h3></div></article>';

  try {
    const response = await fetch('/api/eventos?sort=calendar&limit=500', {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('Não foi possível carregar os Eventos.');
    const data = await response.json();
    timeline.innerHTML = renderTimeline(data.events || []);
  } catch (error) {
    timeline.innerHTML = `
      <article class="timeline-item timeline-item--empty">
        <div><h3>Não foi possível carregar os Eventos neste momento.</h3></div>
      </article>`;
    console.error(error);
  } finally {
    timeline.removeAttribute('aria-busy');
  }
}

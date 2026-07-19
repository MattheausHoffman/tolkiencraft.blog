import { EVENTS } from '../../data/events.js';
import { escapeHTML } from '../../functions/utilities.js';

export function initEventsPage() {
  const timeline = document.querySelector('[data-event-timeline]');
  if (!timeline) return;

  const grouped = Object.groupBy ? Object.groupBy(EVENTS, (event) => event.month) : EVENTS.reduce((acc, event) => {
    (acc[event.month] ||= []).push(event);
    return acc;
  }, {});

  timeline.innerHTML = Object.entries(grouped).map(([month, events]) => `
    <section class="timeline-month" aria-labelledby="month-${month.toLowerCase()}">
      <h2 id="month-${month.toLowerCase()}">${escapeHTML(month)}</h2>
      <div class="timeline-list">
        ${events.map((event) => `
          <article class="timeline-item ${event.featured ? 'timeline-item--featured' : ''}">
            <time>${escapeHTML(event.date)}</time>
            <div><h3>${escapeHTML(event.title)}</h3><p>${escapeHTML(event.type)}</p></div>
          </article>`).join('')}
      </div>
    </section>`).join('');
}

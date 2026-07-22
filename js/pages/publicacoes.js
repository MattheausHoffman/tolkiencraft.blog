import { renderPublicationCards } from '../../functions/publication-cards.js';

export function initPublicationsPage() {
  return renderPublicationCards(document.querySelector('[data-publication-grid]'), { limit: 200, headingLevel: 2 });
}

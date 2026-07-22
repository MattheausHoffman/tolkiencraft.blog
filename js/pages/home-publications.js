import { renderPublicationCards } from '../../functions/publication-cards.js';

export function initHomePublications() {
  return renderPublicationCards(document.querySelector('[data-home-publications]'), { limit: 4, headingLevel: 3 });
}

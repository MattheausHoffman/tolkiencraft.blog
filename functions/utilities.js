export function getBasePath() {
  return document.documentElement.dataset.base || './';
}

export function getCurrentPage() {
  return document.body.dataset.page || 'home';
}

export function setCurrentYear() {
  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

export function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  })[character]);
}

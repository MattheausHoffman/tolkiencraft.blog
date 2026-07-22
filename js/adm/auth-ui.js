let alertTimers = [];

export function showTimedAlert(element, message, duration = 3000, variant = 'error') {
  if (!element) return;

  alertTimers.forEach((timer) => window.clearTimeout(timer));
  alertTimers = [];

  element.hidden = false;
  element.textContent = message;
  element.dataset.variant = variant;
  element.classList.remove('is-visible', 'is-leaving');

  window.requestAnimationFrame(() => {
    element.classList.add('is-visible');
  });

  const leaveDelay = Math.max(0, duration - 200);
  alertTimers.push(window.setTimeout(() => {
    element.classList.add('is-leaving');
  }, leaveDelay));

  alertTimers.push(window.setTimeout(() => {
    element.hidden = true;
    element.textContent = '';
    element.classList.remove('is-visible', 'is-leaving');
    delete element.dataset.variant;
  }, duration));
}

export async function requestCsrfToken() {
  const response = await fetch('/api/auth/csrf', {
    method: 'GET',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) throw new Error('Não foi possível iniciar uma sessão segura.');
  const data = await response.json();
  return data.csrfToken;
}

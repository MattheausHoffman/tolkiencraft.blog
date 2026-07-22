let alertTimers = [];

<<<<<<< HEAD
export function showTimedAlert(element, message, duration = 3000, variant = 'error') {
=======
export function showTimedAlert(element, message, duration = 3000) {
>>>>>>> 980f02e005ec0054436948c190aa1947f401cb2e
  if (!element) return;

  alertTimers.forEach((timer) => window.clearTimeout(timer));
  alertTimers = [];

  element.hidden = false;
  element.textContent = message;
<<<<<<< HEAD
  element.dataset.variant = variant;
=======
>>>>>>> 980f02e005ec0054436948c190aa1947f401cb2e
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
<<<<<<< HEAD
    delete element.dataset.variant;
=======
>>>>>>> 980f02e005ec0054436948c190aa1947f401cb2e
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

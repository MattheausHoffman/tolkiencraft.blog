<<<<<<< HEAD
import { showTimedAlert } from './auth-ui.js';
import { initAdminShell } from './admin-session.js';

async function initDashboard() {
  const alertElement = document.querySelector('[data-auth-alert]');
  try {
    await initAdminShell({ alertElement });
  } catch (error) {
    showTimedAlert(alertElement, error.message);
  }
=======
import { requestCsrfToken, showTimedAlert } from './auth-ui.js';

async function readSession() {
  const response = await fetch('/api/auth/session', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' }
  });

  if (response.status === 401) {
    window.location.replace('/adm/login');
    return null;
  }

  if (!response.ok) throw new Error('Não foi possível validar a sessão.');
  return response.json();
}

async function initDashboard() {
  const logoutButton = document.querySelector('[data-logout-button]');
  const alertElement = document.querySelector('[data-auth-alert]');
  const nameElement = document.querySelector('[data-admin-name]');
  const emailElement = document.querySelector('[data-admin-email]');

  try {
    const session = await readSession();
    if (!session) return;

    if (nameElement) nameElement.textContent = session.admin.nome;
    if (emailElement) emailElement.textContent = session.admin.email;
  } catch (error) {
    showTimedAlert(alertElement, error.message);
  }

  if (!logoutButton) return;

  logoutButton.addEventListener('click', async () => {
    logoutButton.disabled = true;
    logoutButton.textContent = 'Saindo...';

    try {
      const csrfToken = await requestCsrfToken();
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'X-CSRF-Token': csrfToken
        }
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível encerrar a sessão.');
      }

      window.location.replace(data.redirect || '/adm/login');
    } catch (error) {
      showTimedAlert(alertElement, error.message);
      logoutButton.disabled = false;
      logoutButton.textContent = 'Sair';
    }
  });
>>>>>>> 980f02e005ec0054436948c190aa1947f401cb2e
}

initDashboard();

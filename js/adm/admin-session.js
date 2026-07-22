import { requestCsrfToken, showTimedAlert } from './auth-ui.js';

export async function readAdminSession() {
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

export async function initAdminShell({ alertElement = null } = {}) {
  const session = await readAdminSession();
  if (!session) return null;

  document.querySelectorAll('[data-admin-name]').forEach((element) => {
    element.textContent = session.admin.nome;
  });
  document.querySelectorAll('[data-admin-email]').forEach((element) => {
    element.textContent = session.admin.email;
  });

  document.querySelectorAll('[data-logout-button]').forEach((button) => {
    button.addEventListener('click', async () => {
      button.disabled = true;
      const originalText = button.textContent;
      button.textContent = 'Saindo...';
      try {
        const csrfToken = await requestCsrfToken();
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { Accept: 'application/json', 'X-CSRF-Token': csrfToken }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Não foi possível encerrar a sessão.');
        window.location.replace(data.redirect || '/adm/login');
      } catch (error) {
        showTimedAlert(alertElement, error.message);
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  });

  return session;
}

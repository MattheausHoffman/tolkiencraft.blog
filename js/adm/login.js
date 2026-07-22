import { requestCsrfToken, showTimedAlert } from './auth-ui.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(form, fieldName, message = '') {
  const field = form.elements.namedItem(fieldName);
  const errorElement = form.querySelector(`[data-field-error="${fieldName}"]`);

  if (field instanceof HTMLElement) {
    field.setAttribute('aria-invalid', String(Boolean(message)));
  }
  if (errorElement) errorElement.textContent = message;
}

function validateForm(form) {
  const email = String(form.email.value || '').trim();
  const senha = String(form.senha.value || '');
  let isValid = true;

  setFieldError(form, 'email');
  setFieldError(form, 'senha');

  if (!email) {
    setFieldError(form, 'email', 'Informe o email.');
    isValid = false;
  } else if (!EMAIL_PATTERN.test(email)) {
    setFieldError(form, 'email', 'Informe um email válido.');
    isValid = false;
  }

  if (!senha) {
    setFieldError(form, 'senha', 'Informe a senha.');
    isValid = false;
  }

  return { isValid, email, senha };
}

async function initLogin() {
  const form = document.querySelector('[data-login-form]');
  const alertElement = document.querySelector('[data-auth-alert]');
  const submitButton = document.querySelector('[data-submit-button]');
  if (!form || !submitButton) return;

  let csrfToken;

  try {
    csrfToken = await requestCsrfToken();
  } catch (error) {
    showTimedAlert(alertElement, error.message);
  }

  form.addEventListener('input', (event) => {
    if (event.target?.name) setFieldError(form, event.target.name);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const validation = validateForm(form);
    if (!validation.isValid) return;

    submitButton.disabled = true;
    submitButton.textContent = 'Entrando...';

    try {
      csrfToken ||= await requestCsrfToken();

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          email: validation.email,
          senha: validation.senha
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.errors) {
          Object.entries(data.errors).forEach(([field, message]) => {
            setFieldError(form, field, message);
          });
        } else {
          showTimedAlert(alertElement, data.message || 'Não foi possível realizar o login.');
        }

        if (response.status === 403) csrfToken = await requestCsrfToken();
        return;
      }

      window.location.assign(data.redirect || '/adm/dashboard');
    } catch (error) {
      showTimedAlert(alertElement, 'Não foi possível conectar ao servidor.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Entrar';
    }
  });
}

initLogin();

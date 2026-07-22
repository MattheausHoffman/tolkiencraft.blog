const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function validateLoginPayload(payload = {}) {
  const email = normalizeEmail(payload.email);
  const password = typeof payload.senha === 'string' ? payload.senha : '';
  const errors = {};

  if (!email) {
    errors.email = 'Informe o email.';
  } else if (email.length > 255 || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Informe um email válido.';
  }

  if (!password) {
    errors.senha = 'Informe a senha.';
  } else if (password.length > 255) {
    errors.senha = 'A senha informada é inválida.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    data: { email, password },
    errors
  };
}

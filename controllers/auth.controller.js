import { authenticateAdmin } from '../services/auth.service.js';
import { validateLoginPayload } from '../utils/validators.js';
import { rotateCsrfToken } from '../middleware/csrf.middleware.js';

function regenerateSession(request) {
  return new Promise((resolve, reject) => {
    request.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

function saveSession(request) {
  return new Promise((resolve, reject) => {
    request.session.save((error) => (error ? reject(error) : resolve()));
  });
}

function destroySession(request) {
  return new Promise((resolve, reject) => {
    request.session.destroy((error) => (error ? reject(error) : resolve()));
  });
}

export async function login(request, response) {
  response.set('Cache-Control', 'no-store');

  const validation = validateLoginPayload(request.body);
  if (!validation.isValid) {
    return response.status(400).json({
      message: 'Revise os campos informados.',
      errors: validation.errors
    });
  }

  const admin = await authenticateAdmin(validation.data.email, validation.data.password);
  if (!admin) {
    return response.status(401).json({ message: 'Email ou senha incorretos.' });
  }

  await regenerateSession(request);
  request.session.admin = admin;
  rotateCsrfToken(request);
  await saveSession(request);

  return response.status(200).json({
    message: 'Login realizado com sucesso.',
    redirect: '/adm/dashboard'
  });
}

export function getSession(request, response) {
  response.set('Cache-Control', 'no-store');

  if (!request.session?.admin?.id) {
    return response.status(401).json({ authenticated: false });
  }

  return response.json({
    authenticated: true,
    admin: request.session.admin
  });
}

export async function logout(request, response) {
  response.set('Cache-Control', 'no-store');
  await destroySession(request);
  response.clearCookie('tolkiencraft.sid', { path: '/' });

  return response.json({
    message: 'Sessão encerrada.',
    redirect: '/adm/login'
  });
}

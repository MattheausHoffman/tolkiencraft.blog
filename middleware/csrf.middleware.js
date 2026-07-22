import { randomBytes, timingSafeEqual } from 'node:crypto';

function createToken() {
  return randomBytes(32).toString('hex');
}

export function getOrCreateCsrfToken(request) {
  if (!request.session.csrfToken) {
    request.session.csrfToken = createToken();
  }

  return request.session.csrfToken;
}

export function rotateCsrfToken(request) {
  request.session.csrfToken = createToken();
  return request.session.csrfToken;
}

export function provideCsrfToken(request, response) {
  response.set('Cache-Control', 'no-store');
  response.json({ csrfToken: getOrCreateCsrfToken(request) });
}

export function validateCsrfToken(request, response, next) {
  const receivedToken = request.get('x-csrf-token') || '';
  const storedToken = request.session?.csrfToken || '';

  if (!receivedToken || !storedToken || receivedToken.length !== storedToken.length) {
    return response.status(403).json({ message: 'Não foi possível validar a solicitação.' });
  }

  const isValid = timingSafeEqual(
    Buffer.from(receivedToken, 'utf8'),
    Buffer.from(storedToken, 'utf8')
  );

  if (!isValid) {
    return response.status(403).json({ message: 'Não foi possível validar a solicitação.' });
  }

  return next();
}

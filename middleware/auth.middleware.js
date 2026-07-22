export function requireAdmin(request, response, next) {
  if (request.session?.admin?.id) return next();

  response.set('Cache-Control', 'no-store');

  if (request.originalUrl.startsWith('/api/')) {
    return response.status(401).json({ message: 'Autenticação necessária.' });
  }

  return response.redirect(302, '/adm/login');
}

export function redirectAuthenticatedAdmin(request, response, next) {
  if (request.session?.admin?.id) {
    return response.redirect(302, '/adm/dashboard');
  }

  return next();
}

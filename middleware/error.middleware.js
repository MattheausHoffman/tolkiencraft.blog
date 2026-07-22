import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function notFoundHandler(request, response) {
  if (request.accepts('html')) {
    return response.status(404).sendFile(path.join(projectRoot, 'pages/404.html'));
  }

  return response.status(404).json({ message: 'Recurso não encontrado.' });
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);

  console.error('Erro não tratado:', error);
  response.set('Cache-Control', 'no-store');

  if (request.originalUrl.startsWith('/api/')) {
    return response.status(500).json({ message: 'Não foi possível concluir a solicitação.' });
  }

  return response.status(500).send('Erro interno do servidor.');
}

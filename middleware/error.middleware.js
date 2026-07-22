import path from 'node:path';
import { fileURLToPath } from 'node:url';
<<<<<<< HEAD
import multer from 'multer';
=======
>>>>>>> 980f02e005ec0054436948c190aa1947f401cb2e

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function notFoundHandler(request, response) {
  if (request.accepts('html')) {
    return response.status(404).sendFile(path.join(projectRoot, 'pages/404.html'));
  }

  return response.status(404).json({ message: 'Recurso não encontrado.' });
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);

<<<<<<< HEAD
  response.set('Cache-Control', 'no-store');

  let status = Number(error.status) || 500;
  let message = error.message || 'Não foi possível concluir a solicitação.';
  let errors = error.errors || undefined;

  if (error instanceof multer.MulterError) {
    status = 400;
    message = error.code === 'LIMIT_FILE_SIZE'
      ? 'O arquivo excede o limite de 12 MB.'
      : 'O tipo de arquivo enviado não é permitido.';
    errors = undefined;
  }

  if (error?.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = request.originalUrl.includes('/reinos')
      ? 'Já existe um Reino com esse nome ou slug.'
      : 'Já existe uma publicação com esse slug.';
  }

  if (status >= 500) console.error('Erro não tratado:', error);

  if (request.originalUrl.startsWith('/api/')) {
    return response.status(status).json({ message, ...(errors ? { errors } : {}) });
  }

  if (status === 404) {
    return response.status(404).sendFile(path.join(projectRoot, 'pages/404.html'));
  }

  return response.status(status).send(status >= 500 ? 'Erro interno do servidor.' : message);
=======
  console.error('Erro não tratado:', error);
  response.set('Cache-Control', 'no-store');

  if (request.originalUrl.startsWith('/api/')) {
    return response.status(500).json({ message: 'Não foi possível concluir a solicitação.' });
  }

  return response.status(500).send('Erro interno do servidor.');
>>>>>>> 980f02e005ec0054436948c190aa1947f401cb2e
}

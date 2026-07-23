import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import { redirectAuthenticatedAdmin, requireAdmin } from '../middleware/auth.middleware.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const viewsDirectory = path.resolve(currentDirectory, '../views/adm');

function noStore(request, response, next) {
  response.set('Cache-Control', 'no-store, private');
  next();
}

export const adminRouter = Router();

adminRouter.use(noStore);
adminRouter.get('/', (request, response) => {
  response.redirect(request.session?.admin?.id ? '/adm/dashboard' : '/adm/login');
});
adminRouter.get('/login', redirectAuthenticatedAdmin, (request, response) => {
  response.sendFile(path.join(viewsDirectory, 'login.html'));
});
adminRouter.get('/dashboard', requireAdmin, (request, response) => {
  response.sendFile(path.join(viewsDirectory, 'dashboard.html'));
});
adminRouter.get('/publicacoes', requireAdmin, (request, response) => {
  response.sendFile(path.join(viewsDirectory, 'publications.html'));
});
adminRouter.get('/publicacoes/nova', requireAdmin, (request, response) => {
  response.sendFile(path.join(viewsDirectory, 'publication-editor.html'));
});
adminRouter.get('/publicacoes/:id/editar', requireAdmin, (request, response) => {
  response.sendFile(path.join(viewsDirectory, 'publication-editor.html'));
});

adminRouter.get('/reinos', requireAdmin, (request, response) => {
  response.sendFile(path.join(viewsDirectory, 'kingdoms.html'));
});
adminRouter.get('/reinos/novo', requireAdmin, (request, response) => {
  response.sendFile(path.join(viewsDirectory, 'kingdom-editor.html'));
});
adminRouter.get('/reinos/:id/pagina', requireAdmin, (request, response) => {
  response.sendFile(path.join(viewsDirectory, 'kingdom-page-editor.html'));
});
adminRouter.get('/reinos/:id/editar', requireAdmin, (request, response) => {
  response.sendFile(path.join(viewsDirectory, 'kingdom-editor.html'));
});

adminRouter.get('/eventos', requireAdmin, (request, response) => {
  response.sendFile(path.join(viewsDirectory, 'events.html'));
});
adminRouter.get('/eventos/novo', requireAdmin, (request, response) => {
  response.sendFile(path.join(viewsDirectory, 'event-editor.html'));
});
adminRouter.get('/eventos/:id/editar', requireAdmin, (request, response) => {
  response.sendFile(path.join(viewsDirectory, 'event-editor.html'));
});

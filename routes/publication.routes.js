import { Router } from 'express';
import {
  getPublicPublication,
  listPublicPublications,
  renderPublicPublication
} from '../controllers/publication.controller.js';

export const publicationRouter = Router();

publicationRouter.get('/api/publicacoes', listPublicPublications);
publicationRouter.get('/api/publicacoes/:slug', getPublicPublication);
publicationRouter.get('/publicacoes', (request, response) => response.redirect(302, '/pages/publicacoes.html'));
publicationRouter.get('/publicacoes/:slug', renderPublicPublication);
publicationRouter.get('/pages/posts/codigo-guerra.html', (request, response) => response.redirect(301, '/publicacoes/codigo-de-guerra-dos-reinos'));
publicationRouter.get('/pages/posts/sistema-terrenos.html', (request, response) => response.redirect(301, '/publicacoes/sistema-de-terrenos-do-servidor'));

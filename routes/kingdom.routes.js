import { Router } from 'express';
import {
  getPublicKingdom,
  getPublicKingdomPage,
  listPublicKingdoms,
  renderPublicKingdom
} from '../controllers/kingdom.controller.js';

export const kingdomRouter = Router();

kingdomRouter.get('/api/reinos', listPublicKingdoms);
kingdomRouter.get('/api/reinos/:slug/pagina', getPublicKingdomPage);
kingdomRouter.get('/api/reinos/:slug', getPublicKingdom);

kingdomRouter.get('/reinos/:slug', renderPublicKingdom);

import { Router } from 'express';
import { getPublicKingdom, listPublicKingdoms, redirectPublicKingdom } from '../controllers/kingdom.controller.js';

export const kingdomRouter = Router();

kingdomRouter.get('/api/reinos', listPublicKingdoms);
kingdomRouter.get('/api/reinos/:slug', getPublicKingdom);

kingdomRouter.get('/reinos/:slug', redirectPublicKingdom);

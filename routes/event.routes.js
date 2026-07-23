import { Router } from 'express';
import { listPublicEvents } from '../controllers/event.controller.js';

export const eventRouter = Router();

eventRouter.get('/api/eventos', listPublicEvents);

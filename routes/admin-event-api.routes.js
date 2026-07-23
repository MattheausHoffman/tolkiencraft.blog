import { Router } from 'express';
import {
  createAdminEvent,
  deleteAdminEvent,
  getAdminEvent,
  listAdminEvents,
  updateAdminEvent
} from '../controllers/event.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { validateCsrfToken } from '../middleware/csrf.middleware.js';

export const adminEventApiRouter = Router();

adminEventApiRouter.use(requireAdmin);
adminEventApiRouter.get('/eventos', listAdminEvents);
adminEventApiRouter.get('/eventos/:id', getAdminEvent);
adminEventApiRouter.post('/eventos', validateCsrfToken, createAdminEvent);
adminEventApiRouter.put('/eventos/:id', validateCsrfToken, updateAdminEvent);
adminEventApiRouter.delete('/eventos/:id', validateCsrfToken, deleteAdminEvent);

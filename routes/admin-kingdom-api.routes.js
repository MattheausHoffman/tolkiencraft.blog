import { Router } from 'express';
import {
  createAdminKingdom,
  deleteAdminKingdom,
  getAdminKingdom,
  listAdminKingdoms,
  updateAdminKingdom
} from '../controllers/kingdom.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { validateCsrfToken } from '../middleware/csrf.middleware.js';

export const adminKingdomApiRouter = Router();

adminKingdomApiRouter.use(requireAdmin);
adminKingdomApiRouter.get('/reinos', listAdminKingdoms);
adminKingdomApiRouter.get('/reinos/:id', getAdminKingdom);
adminKingdomApiRouter.post('/reinos', validateCsrfToken, createAdminKingdom);
adminKingdomApiRouter.put('/reinos/:id', validateCsrfToken, updateAdminKingdom);
adminKingdomApiRouter.delete('/reinos/:id', validateCsrfToken, deleteAdminKingdom);

import { Router } from 'express';
import {
  createAdminRule,
  deleteAdminRule,
  getAdminRule,
  listAdminRules,
  updateAdminRule
} from '../controllers/rule.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { validateCsrfToken } from '../middleware/csrf.middleware.js';

export const adminRuleApiRouter = Router();

adminRuleApiRouter.use(requireAdmin);
adminRuleApiRouter.get('/regras', listAdminRules);
adminRuleApiRouter.get('/regras/:id', getAdminRule);
adminRuleApiRouter.post('/regras', validateCsrfToken, createAdminRule);
adminRuleApiRouter.put('/regras/:id', validateCsrfToken, updateAdminRule);
adminRuleApiRouter.delete('/regras/:id', validateCsrfToken, deleteAdminRule);

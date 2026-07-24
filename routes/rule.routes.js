import { Router } from 'express';
import { listPublicRules } from '../controllers/rule.controller.js';

export const ruleRouter = Router();

ruleRouter.get('/api/regras', listPublicRules);

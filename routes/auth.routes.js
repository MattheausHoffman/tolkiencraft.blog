import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { getSession, login, logout } from '../controllers/auth.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { provideCsrfToken, validateCsrfToken } from '../middleware/csrf.middleware.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (request, response) => {
    response.status(429).json({
      message: 'Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente.'
    });
  }
});

export const authRouter = Router();

authRouter.get('/csrf', provideCsrfToken);
authRouter.get('/session', getSession);
authRouter.post('/login', loginLimiter, validateCsrfToken, login);
authRouter.post('/logout', requireAdmin, validateCsrfToken, logout);

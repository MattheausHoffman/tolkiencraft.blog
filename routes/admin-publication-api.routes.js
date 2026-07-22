import { Router } from 'express';
import {
  createAdminPublication,
  deleteAdminPublication,
  getAdminPublication,
  listAdminPublications,
  updateAdminPublication,
  uploadAdminMedia
} from '../controllers/publication.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { validateCsrfToken } from '../middleware/csrf.middleware.js';
import { uploadPublicationFile } from '../middleware/upload.middleware.js';

export const adminPublicationApiRouter = Router();

adminPublicationApiRouter.use(requireAdmin);
adminPublicationApiRouter.get('/publicacoes', listAdminPublications);
adminPublicationApiRouter.get('/publicacoes/:id', getAdminPublication);
adminPublicationApiRouter.post('/publicacoes', validateCsrfToken, createAdminPublication);
adminPublicationApiRouter.put('/publicacoes/:id', validateCsrfToken, updateAdminPublication);
adminPublicationApiRouter.delete('/publicacoes/:id', validateCsrfToken, deleteAdminPublication);
adminPublicationApiRouter.post('/uploads', validateCsrfToken, uploadPublicationFile, uploadAdminMedia);

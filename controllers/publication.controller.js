import path from 'node:path';
import { createMediaRecord, getPublicationById, getPublishedPublicationBySlug, listPublications } from '../models/publication.model.js';
import { createPublication, removePublication, updatePublication } from '../services/publication.service.js';
import { renderPublicationPage } from '../services/publication-renderer.service.js';
import { HttpError } from '../utils/http-error.js';
import { mediaTypeFromMime } from '../middleware/upload.middleware.js';

function positiveInteger(value, fallback, maximum = 500) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

export async function listPublicPublications(request, response) {
  const publications = await listPublications({
    includeDrafts: false,
    search: String(request.query.search || '').trim().slice(0, 180),
    sort: String(request.query.sort || 'order_asc'),
    limit: positiveInteger(request.query.limit, 100),
    offset: Math.max(Number.parseInt(request.query.offset, 10) || 0, 0)
  });
  response.set('Cache-Control', 'public, max-age=60');
  response.json({ publications });
}

export async function getPublicPublication(request, response) {
  const publication = await getPublishedPublicationBySlug(request.params.slug);
  if (!publication) throw new HttpError(404, 'Publicação não encontrada.');
  response.set('Cache-Control', 'public, max-age=60');
  response.json({ publication });
}

export async function renderPublicPublication(request, response) {
  const publication = await getPublishedPublicationBySlug(request.params.slug);
  if (!publication) throw new HttpError(404, 'Publicação não encontrada.');
  response.set('Cache-Control', 'public, max-age=60');
  response.type('html').send(renderPublicationPage(publication));
}

export async function listAdminPublications(request, response) {
  const publications = await listPublications({
    includeDrafts: true,
    status: String(request.query.status || ''),
    search: String(request.query.search || '').trim().slice(0, 180),
    sort: String(request.query.sort || 'updated'),
    limit: positiveInteger(request.query.limit, 250),
    offset: Math.max(Number.parseInt(request.query.offset, 10) || 0, 0)
  });
  response.set('Cache-Control', 'no-store');
  response.json({ publications });
}

export async function getAdminPublication(request, response) {
  const publication = await getPublicationById(Number.parseInt(request.params.id, 10));
  if (!publication) throw new HttpError(404, 'Publicação não encontrada.');
  response.set('Cache-Control', 'no-store');
  response.json({ publication });
}

export async function createAdminPublication(request, response) {
  const publication = await createPublication(request.body, request.session.admin);
  response.status(201).json({
    message: publication.status === 'published' ? 'Publicação criada e publicada.' : 'Rascunho salvo com sucesso.',
    publication,
    redirect: `/adm/publicacoes/${publication.id}/editar`
  });
}

export async function updateAdminPublication(request, response) {
  const publication = await updatePublication(
    Number.parseInt(request.params.id, 10),
    request.body,
    request.session.admin
  );
  response.json({
    message: publication.status === 'published' ? 'Publicação atualizada.' : 'Rascunho atualizado.',
    publication
  });
}

export async function deleteAdminPublication(request, response) {
  await removePublication(Number.parseInt(request.params.id, 10));
  response.json({ message: 'Publicação excluída com sucesso.' });
}

export async function uploadAdminMedia(request, response) {
  if (!request.file) throw new HttpError(400, 'Selecione um arquivo válido.');
  const mediaType = mediaTypeFromMime(request.file.mimetype);
  const folder = mediaType === 'image' ? 'images' : 'files';
  const publicUrl = `/assets/uploads/${folder}/${path.basename(request.file.filename)}`;
  const publicationId = Number.parseInt(request.body.publicationId, 10) || null;
  const media = await createMediaRecord({
    publicationId,
    adminId: request.session.admin.id,
    originalName: request.file.originalname.slice(0, 255),
    storedName: request.file.filename,
    publicUrl,
    mimeType: request.file.mimetype,
    fileSize: request.file.size,
    mediaType
  });

  response.status(201).json({ message: 'Arquivo enviado com sucesso.', media });
}

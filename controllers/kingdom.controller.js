import { getKingdomById, getKingdomBySlug, listKingdoms } from '../models/kingdom.model.js';
import { createKingdom, removeKingdom, updateKingdom } from '../services/kingdom.service.js';
import { HttpError } from '../utils/http-error.js';

function positiveInteger(value, fallback, maximum = 500) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function queryOptions(request, fallbackSort = 'order_asc') {
  return {
    status: String(request.query.status || ''),
    search: String(request.query.search || '').trim().slice(0, 180),
    sort: String(request.query.sort || fallbackSort),
    limit: positiveInteger(request.query.limit, 250),
    offset: Math.max(Number.parseInt(request.query.offset, 10) || 0, 0)
  };
}

export async function listPublicKingdoms(request, response) {
  const kingdoms = await listKingdoms(queryOptions(request, 'order_asc'));
  response.set('Cache-Control', 'no-store');
  response.json({ kingdoms });
}

export async function getPublicKingdom(request, response) {
  const kingdom = await getKingdomBySlug(request.params.slug);
  if (!kingdom) throw new HttpError(404, 'Reino não encontrado.');
  response.set('Cache-Control', 'no-store');
  response.json({ kingdom });
}


export async function redirectPublicKingdom(request, response) {
  const kingdom = await getKingdomBySlug(request.params.slug);
  if (!kingdom) throw new HttpError(404, 'Reino não encontrado.');
  response.redirect(302, `/pages/reinos.html#${encodeURIComponent(kingdom.slug)}`);
}

export async function listAdminKingdoms(request, response) {
  const kingdoms = await listKingdoms(queryOptions(request, 'updated'));
  response.set('Cache-Control', 'no-store');
  response.json({ kingdoms });
}

export async function getAdminKingdom(request, response) {
  const kingdom = await getKingdomById(Number.parseInt(request.params.id, 10));
  if (!kingdom) throw new HttpError(404, 'Reino não encontrado.');
  response.set('Cache-Control', 'no-store');
  response.json({ kingdom });
}

export async function createAdminKingdom(request, response) {
  const kingdom = await createKingdom(request.body);
  response.status(201).json({
    message: 'Reino criado com sucesso.',
    kingdom,
    redirect: `/adm/reinos/${kingdom.id}/editar`
  });
}

export async function updateAdminKingdom(request, response) {
  const kingdom = await updateKingdom(Number.parseInt(request.params.id, 10), request.body);
  response.json({ message: 'Reino atualizado com sucesso.', kingdom });
}

export async function deleteAdminKingdom(request, response) {
  await removeKingdom(Number.parseInt(request.params.id, 10));
  response.json({ message: 'Reino excluído com sucesso.' });
}

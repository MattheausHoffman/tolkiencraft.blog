import { getEventById, listEvents } from '../models/event.model.js';
import { createEvent, removeEvent, updateEvent } from '../services/event.service.js';
import { HttpError } from '../utils/http-error.js';

function positiveInteger(value, fallback, maximum = 500) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function eventId(value) {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, 'Evento não encontrado.');
  return id;
}

function queryOptions(request, fallbackSort = 'calendar') {
  const parsedMonth = Number.parseInt(request.query.month, 10);
  return {
    year: new Date().getFullYear(),
    month: Number.isInteger(parsedMonth) ? parsedMonth : 0,
    search: String(request.query.search || '').trim().slice(0, 180),
    sort: String(request.query.sort || fallbackSort),
    limit: positiveInteger(request.query.limit, 500),
    offset: Math.max(Number.parseInt(request.query.offset, 10) || 0, 0)
  };
}

export async function listPublicEvents(request, response) {
  const currentYear = new Date().getFullYear();
  const events = await listEvents(queryOptions(request, 'calendar'));
  response.set('Cache-Control', 'no-store');
  response.json({ currentYear, events });
}

export async function listAdminEvents(request, response) {
  const currentYear = new Date().getFullYear();
  const events = await listEvents(queryOptions(request, 'calendar'));
  response.set('Cache-Control', 'no-store');
  response.json({ currentYear, events });
}

export async function getAdminEvent(request, response) {
  const event = await getEventById(eventId(request.params.id));
  if (!event) throw new HttpError(404, 'Evento não encontrado.');
  response.set('Cache-Control', 'no-store');
  response.json({ currentYear: new Date().getFullYear(), event });
}

export async function createAdminEvent(request, response) {
  const event = await createEvent(request.body);
  response.status(201).json({
    message: 'Evento criado com sucesso.',
    event,
    redirect: `/adm/eventos/${event.id}/editar`
  });
}

export async function updateAdminEvent(request, response) {
  const event = await updateEvent(eventId(request.params.id), request.body);
  response.json({ message: 'Evento atualizado com sucesso.', event });
}

export async function deleteAdminEvent(request, response) {
  await removeEvent(eventId(request.params.id));
  response.json({ message: 'Evento excluído com sucesso.' });
}

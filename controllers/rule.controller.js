import { getRuleById, listRules } from '../models/rule.model.js';
import { createRule, removeRule, updateRule } from '../services/rule.service.js';
import { HttpError } from '../utils/http-error.js';

function positiveInteger(value, fallback, maximum = 500) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function ruleId(value) {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, 'Regra não encontrada.');
  return id;
}

function queryOptions(request, includeInactive = false) {
  return {
    includeInactive,
    status: String(request.query.status || ''),
    search: String(request.query.search || '').trim().slice(0, 180),
    sort: String(request.query.sort || 'order_asc'),
    limit: positiveInteger(request.query.limit, 500),
    offset: Math.max(Number.parseInt(request.query.offset, 10) || 0, 0)
  };
}

export async function listPublicRules(request, response) {
  const rules = await listRules(queryOptions(request, false));
  response.set('Cache-Control', 'no-store');
  response.json({ rules });
}

export async function listAdminRules(request, response) {
  const rules = await listRules(queryOptions(request, true));
  response.set('Cache-Control', 'no-store');
  response.json({ rules });
}

export async function getAdminRule(request, response) {
  const rule = await getRuleById(ruleId(request.params.id));
  if (!rule) throw new HttpError(404, 'Regra não encontrada.');
  response.set('Cache-Control', 'no-store');
  response.json({ rule });
}

export async function createAdminRule(request, response) {
  const rule = await createRule(request.body);
  response.status(201).json({
    message: 'Regra criada com sucesso.',
    rule,
    redirect: `/adm/regras/${rule.id}/editar`
  });
}

export async function updateAdminRule(request, response) {
  const rule = await updateRule(ruleId(request.params.id), request.body);
  response.json({ message: 'Regra atualizada com sucesso.', rule });
}

export async function deleteAdminRule(request, response) {
  await removeRule(ruleId(request.params.id));
  response.json({ message: 'Regra excluída com sucesso.' });
}

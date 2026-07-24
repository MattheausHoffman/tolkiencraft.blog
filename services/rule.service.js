import {
  createRuleRecord,
  deleteRuleRecord,
  getRuleById,
  ruleSlugExists,
  ruleTitleExists,
  updateRuleRecord
} from '../models/rule.model.js';
import { HttpError } from '../utils/http-error.js';
import { slugify } from '../utils/slug.js';

function text(value) {
  return String(value ?? '').trim();
}

function normalizeSections(value, errors) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    errors.sections = 'As seções da Regra são inválidas.';
    return [];
  }
  if (value.length > 30) {
    errors.sections = 'Cada Regra pode possuir no máximo 30 seções.';
    return [];
  }

  const sections = [];
  for (let index = 0; index < value.length; index += 1) {
    const rawSection = value[index] || {};
    const title = text(rawSection.title);
    const rawItems = Array.isArray(rawSection.items) ? rawSection.items : [];
    const items = rawItems.map(text).filter(Boolean);

    if (!title) {
      errors.sections = `Informe o título da seção ${index + 1}.`;
      continue;
    }
    if (title.length > 120) {
      errors.sections = `O título da seção ${index + 1} deve possuir no máximo 120 caracteres.`;
      continue;
    }
    if (rawItems.length > 50) {
      errors.sections = `A seção ${index + 1} pode possuir no máximo 50 itens.`;
      continue;
    }
    if (items.some((item) => item.length > 500)) {
      errors.sections = `Os itens da seção ${index + 1} devem possuir no máximo 500 caracteres.`;
      continue;
    }
    if (items.length === 0) {
      errors.sections = `Adicione ao menos um item à seção ${index + 1}.`;
      continue;
    }

    sections.push({ title, items });
  }

  return sections;
}

export function validateRulePayload(payload = {}) {
  const titulo = text(payload.titulo);
  const descricao = text(payload.descricao);
  const requestedStatus = text(payload.status) || 'active';
  const status = requestedStatus === 'inactive' ? 'inactive' : 'active';
  const parsedOrder = Number(payload.ordemExibicao);
  const ordemExibicao = Number.isInteger(parsedOrder) ? parsedOrder : 0;
  const errors = {};
  const sections = normalizeSections(payload.sections, errors);

  if (!titulo) errors.titulo = 'Informe o título da Regra.';
  else if (titulo.length > 180) errors.titulo = 'O título deve possuir no máximo 180 caracteres.';
  if (!descricao) errors.descricao = 'Informe a descrição da Regra.';
  else if (descricao.length > 500) errors.descricao = 'A descrição deve possuir no máximo 500 caracteres.';
  if (!['active', 'inactive'].includes(requestedStatus)) errors.status = 'Selecione um status válido.';
  if (!Number.isInteger(parsedOrder)) errors.ordemExibicao = 'Informe uma ordem de exibição válida.';
  else if (ordemExibicao < -100000 || ordemExibicao > 100000) {
    errors.ordemExibicao = 'A ordem deve estar entre -100000 e 100000.';
  }

  if (Object.keys(errors).length) {
    throw new HttpError(400, 'Revise os campos da Regra.', errors);
  }

  return { titulo, descricao, sections, ordemExibicao, status };
}

async function uniqueSlug(titulo, excludeId = null) {
  const base = slugify(titulo) || 'regra';
  let slug = base;
  let suffix = 2;
  while (await ruleSlugExists(slug, excludeId)) {
    slug = `${base.slice(0, 184)}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

async function prepareRule(payload, excludeId = null) {
  const rule = validateRulePayload(payload);
  if (await ruleTitleExists(rule.titulo, excludeId)) {
    throw new HttpError(400, 'Revise os campos da Regra.', {
      titulo: 'Já existe uma Regra com esse título.'
    });
  }
  rule.slug = await uniqueSlug(rule.titulo, excludeId);
  return rule;
}

export async function createRule(payload) {
  return createRuleRecord(await prepareRule(payload));
}

export async function updateRule(id, payload) {
  const existing = await getRuleById(id);
  if (!existing) throw new HttpError(404, 'Regra não encontrada.');
  return updateRuleRecord(id, await prepareRule(payload, id));
}

export async function removeRule(id) {
  const deleted = await deleteRuleRecord(id);
  if (!deleted) throw new HttpError(404, 'Regra não encontrada.');
  return true;
}
